// Nouveau src/auth/auth.service.ts simplifié
import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly KEYCLOAK_TOKEN_URL =
    'http://localhost:8080/realms/NestBlog/protocol/openid-connect/token';
  private readonly KEYCLOAK_REGISTER_URL =
    'http://localhost:8080/realms/NestBlog/protocol/openid-connect/registrations';
  private readonly clientId = 'nestblog-backend';
  private readonly clientSecret = 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT';

  async login(usernameOrEmail: string, password: string) {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'password');
      params.append('username', usernameOrEmail);
      params.append('password', password);

      const response = await axios.post(
        this.KEYCLOAK_TOKEN_URL,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(userData: any) {
    try {
      const response = await axios.post(
        this.KEYCLOAK_REGISTER_URL,
        {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: userData.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Après inscription réussie, connectez l'utilisateur automatiquement
      return this.login(userData.username, userData.password);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      throw new UnauthorizedException('Registration failed');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const response = await axios.post(
        this.KEYCLOAK_TOKEN_URL,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
      };
    } catch (err) {
      throw new UnauthorizedException('Failed to refresh token');
    }
  }
}
