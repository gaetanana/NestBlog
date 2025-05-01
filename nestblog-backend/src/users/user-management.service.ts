import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
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
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.KEYCLOAK_URL = 'http://localhost:8080';
    this.REALM = 'NestBlog';
    this.CLIENT_ID = 'nestblog-backend';
    this.CLIENT_SECRET = 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT';
  }

  // Méthode pour obtenir un token admin
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

  // Méthode déplacée depuis UsersService
  async findOrCreateFromKeycloak(payload: any): Promise<User> {
    if (!payload || !payload.preferred_username) {
      throw new Error('Invalid Keycloak payload');
    }

    const keycloakId = payload.sub;
    const username = payload.preferred_username;

    // Recherche d'abord par username (constant)
    let user = await this.prisma.user.findUnique({ where: { username } });

    if (user) {
      // Si trouvé, mettre à jour l'ID pour correspondre au nouveau ID Keycloak
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

    // Si non trouvé, créer l'utilisateur
    console.log(`Creating new user from Keycloak: ${username}`);
    return this.usersService.createUserInDB({
      id: keycloakId,
      username: username,
      email: payload.email,
      name:
        payload.name ||
        `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
    });
  }

  // Méthode déplacée depuis UsersService
  async getCurrentUserProfile(keycloakPayload: any): Promise<any> {
    const user = await this.findOrCreateFromKeycloak(keycloakPayload);

    const userData = {
      ...user,
      roles: keycloakPayload.realm_access?.roles || [],
    };

    return userData;
  }

  // Méthode pour mettre à jour un utilisateur dans Keycloak/LDAP
  async updateUser(userId: string, userData: any) {
    try {
      // 1. Mettre à jour l'utilisateur dans Keycloak
      const token = await this.getAdminToken();

      // Préparer les données pour Keycloak
      const keycloakUserData = {
        firstName: userData.firstName || userData.name?.split(' ')[0],
        lastName:
          userData.lastName || userData.name?.split(' ').slice(1).join(' '),
        email: userData.email,
        username: userData.username,
        enabled: true,
      };

      // Mise à jour dans Keycloak
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

      // 2. Mise à jour dans PostgreSQL
      const { username, email, password, firstName, lastName, ...appData } =
        userData;

      // Vérifier si l'utilisateur existe dans PostgreSQL
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        // Créer l'utilisateur s'il n'existe pas
        return this.usersService.createUserInDB({
          id: userId,
          username: userData.username,
          email: userData.email,
          name:
            userData.name ||
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        });
      }

      // Mettre à jour les champs d'identité dans PostgreSQL
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          username: userData.username,
          email: userData.email,
          name:
            userData.name ||
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Méthode pour changer le mot de passe
  async changePassword(userId: string, newPassword: string) {
    try {
      const token = await this.getAdminToken();

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
}
