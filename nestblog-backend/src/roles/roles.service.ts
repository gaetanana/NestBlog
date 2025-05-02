import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RolesService {
  private readonly KEYCLOAK_URL: string;
  private readonly REALM: string;
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(private configService: ConfigService) {
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

  async getAllRoles() {
    try {
      const token = await this.getAdminToken();

      const response = await axios.get(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Filtrer les rôles internes
      const roles = response.data
        .filter(
          (role) =>
            !role.name.startsWith('uma_') && !role.name.startsWith('offline_'),
        )
        .map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description || `${role.name} role`,
          isDefault: role.name === 'user',
        }));

      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to retrieve roles');
    }
  }

  async getRoleByName(roleName: string) {
    try {
      const token = await this.getAdminToken();

      const response = await axios.get(
        `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/roles/${roleName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        composite: response.data.composite,
        clientRole: response.data.clientRole,
      };
    } catch (error) {
      console.error(`Error fetching role '${roleName}':`, error);
      throw new Error(`Failed to retrieve role '${roleName}'`);
    }
  }
}
