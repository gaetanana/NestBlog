// src/users/user-management.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class UserManagementService {
  private readonly KEYCLOAK_URL: string;
  private readonly REALM: string;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.KEYCLOAK_URL = 'http://localhost:8080';
    this.REALM = 'NestBlog';
    this.CLIENT_ID = 'nestblog-backend';
    this.CLIENT_SECRET = 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT';
  }

  /**
   * Get an admin token from Keycloak for management operations
   */
  private async getAdminToken() {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.CLIENT_ID);
      params.append('client_secret', this.CLIENT_SECRET);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(
        `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting admin token:', error);
      throw new Error('Failed to get admin token');
    }
  }

  /**
   * Create a new user in both Keycloak and the local database
   */
  async createUser(userData: any) {
    try {
      // 1. Create the user in Keycloak/LDAP
      const token = await this.getAdminToken();

      const keycloakUserData = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName:
          userData.lastName ||
          userData.name?.split(' ').slice(1).join(' ') ||
          '',
        enabled: userData.enabled !== false, // Default to enabled
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ],
      };

      // Create the user in Keycloak
      const response = await axios.post(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users`,
        keycloakUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Get the ID of the created user
      const locationHeader = response.headers.location;
      const userId = locationHeader.substring(
        locationHeader.lastIndexOf('/') + 1,
      );

      // 2. If roles were specified, assign them
      if (
        userData.roles &&
        Array.isArray(userData.roles) &&
        userData.roles.length > 0
      ) {
        await this.updateUserRoles(userId, userData.roles);
      }

      // 3. Create the user in the local database
      const { password, roles, ...userDataWithoutPassword } = userData;

      return this.prisma.user.create({
        data: {
          id: userId,
          username: userData.username,
          email: userData.email,
          name:
            userData.name ||
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find or create a user based on Keycloak information
   */
  async findOrCreateFromKeycloak(payload: any): Promise<User> {
    if (!payload || !payload.preferred_username) {
      throw new Error('Invalid Keycloak payload');
    }

    const keycloakId = payload.sub;
    const username = payload.preferred_username;

    // First look up by username (which should be constant)
    let user = await this.prisma.user.findUnique({ where: { username } });

    if (user) {
      // If found, update the ID to match the new Keycloak ID if needed
      if (user.id !== keycloakId) {
        console.log(
          `Updating user ID for ${username} from ${user.id} to ${keycloakId}`,
        );
        user = await this.prisma.user.update({
          where: { username },
          data: { id: keycloakId },
        });
      }
      return user;
    }

    // If not found, create the user
    console.log(`Creating new user from Keycloak: ${username}`);
    return this.prisma.user.create({
      data: {
        id: keycloakId,
        username: username,
        email: payload.email,
        name:
          payload.name || `${payload.given_name} ${payload.family_name}`.trim(),
      },
    });
  }

  /**
   * Get the current user's complete profile with Keycloak roles
   */
  async getCurrentUserProfile(keycloakPayload: any): Promise<any> {
    const user = await this.findOrCreateFromKeycloak(keycloakPayload);

    // Get the Keycloak user information
    try {
      const token = await this.getAdminToken();
      const response = await axios.get(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Combine data from both sources
      const userData = {
        ...user,
        enabled: response.data.enabled,
        roles: keycloakPayload.realm_access?.roles || [],
      };

      return userData;
    } catch (error) {
      // If we can't get Keycloak details, just return what we have
      console.warn('Could not get Keycloak user details:', error);
      return {
        ...user,
        roles: keycloakPayload.realm_access?.roles || [],
      };
    }
  }

  /**
   * Update user identity information in Keycloak
   */
  async updateUser(userId: string, userData: any) {
    try {
      // 1. Update the user in Keycloak
      const token = await this.getAdminToken();

      // Prepare the data for Keycloak (identity information)
      const keycloakUserData = {
        firstName: userData.firstName || userData.name?.split(' ')[0],
        lastName:
          userData.lastName || userData.name?.split(' ').slice(1).join(' '),
        email: userData.email,
        username: userData.username,
      };

      // Update the user in Keycloak (and LDAP by extension)
      await axios.put(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}`,
        keycloakUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 2. Update application-specific data in PostgreSQL
      // (exclude identity fields managed by Keycloak/LDAP)
      const { username, email, password, firstName, lastName, ...appData } =
        userData;

      // Check if the user exists in PostgreSQL
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return this.prisma.user.create({
          data: {
            id: userId,
            username: userData.username,
            email: userData.email,
            name:
              userData.name ||
              `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          },
        });
      }

      // Update the existing user
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          ...appData,
          name: userData.name,
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Change a user's password in Keycloak
   */
  async changePassword(userId: string, newPassword: string) {
    try {
      const token = await this.getAdminToken();

      // Change the password in Keycloak
      await axios.put(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}/reset-password`,
        {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  async updateUserStatus(userId: string, enabled: boolean) {
    try {
      const token = await this.getAdminToken();

      // D'abord, récupérer les données actuelles de l'utilisateur
      const response = await axios.get(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const userData = response.data;

      // Mettre à jour uniquement le champ 'enabled'
      await axios.put(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}`,
        {
          ...userData,
          enabled,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { success: true, userId, enabled };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  async updateUserRoles(userId: string, roles: string[]) {
    try {
      const token = await this.getAdminToken();

      // Récupérer tous les rôles disponibles
      const roleResponse = await axios.get(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const availableRoles = roleResponse.data;

      // Filtrer les rôles pour inclure uniquement les valides
      const validRoles = roles.filter((role) =>
        availableRoles.some((availableRole) => availableRole.name === role),
      );

      if (validRoles.length === 0) {
        throw new Error('No valid roles specified');
      }

      // Transformer les noms de rôles en objets rôle
      const roleObjects = validRoles.map((role) => {
        const roleObj = availableRoles.find((r) => r.name === role);
        return {
          id: roleObj.id,
          name: roleObj.name,
        };
      });

      // Ajouter les rôles à l'utilisateur
      await axios.post(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}/role-mappings/realm`,
        roleObjects,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { success: true, userId, roles: validRoles };
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  }
}
