import { Injectable } from '@nestjs/common';
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

  async createUser(userData: any) {
    try {
      // 1. Créer l'utilisateur dans Keycloak/LDAP
      const token = await this.getAdminToken();

      const keycloakUserData = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName:
          userData.lastName ||
          userData.name?.split(' ').slice(1).join(' ') ||
          '',
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: userData.password,
            temporary: false,
          },
        ],
      };

      // Création dans Keycloak
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

      // Récupérer l'ID de l'utilisateur créé
      const locationHeader = response.headers.location;
      const userId = locationHeader.substring(
        locationHeader.lastIndexOf('/') + 1,
      );

      // 2. Créer l'utilisateur dans la base de données locale
      const { password, ...userDataWithoutPassword } = userData;

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
   * Trouve ou crée un utilisateur basé sur les informations Keycloak
   */
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
   * Récupère l'utilisateur actuel avec ses données complètes (pour profil utilisateur)
   */
  async getCurrentUserProfile(keycloakPayload: any): Promise<any> {
    const user = await this.findOrCreateFromKeycloak(keycloakPayload);

    // Ici, vous pouvez enrichir l'utilisateur avec des données supplémentaires
    // spécifiques à votre application
    const userData = {
      ...user,
      roles: keycloakPayload.realm_access?.roles || [],
      // Autres données spécifiques à l'application
    };

    return userData;
  }

  async updateUser(userId: string, userData: any) {
    try {
      // 1. Mettre à jour l'utilisateur dans Keycloak
      const token = await this.getAdminToken();

      // Préparer les données pour Keycloak (identité utilisateur)
      const keycloakUserData = {
        firstName: userData.firstName || userData.name?.split(' ')[0],
        lastName:
          userData.lastName || userData.name?.split(' ').slice(1).join(' '),
        email: userData.email,
        username: userData.username,
        enabled: true,
      };

      // Mise à jour de l'utilisateur dans Keycloak (et donc aussi dans LDAP)
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

      // 2. Mise à jour des données spécifiques à l'application dans PostgreSQL
      // (exclure les champs d'identité qui sont gérés par Keycloak/LDAP)
      const { username, email, password, firstName, lastName, ...appData } =
        userData;

      // Si l'utilisateur n'existe pas encore dans PostgreSQL, le créer
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

      // Mettre à jour l'utilisateur existant
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

  async changePassword(userId: string, newPassword: string) {
    try {
      const token = await this.getAdminToken();

      // Changer le mot de passe dans Keycloak
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
