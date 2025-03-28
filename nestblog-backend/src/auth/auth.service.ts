import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    private readonly KEYCLOAK_TOKEN_URL = 'http://localhost:8080/realms/NestBlog/protocol/openid-connect/token';
    private readonly clientId = 'nestblog-backend';
    private readonly clientSecret = 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT';

    async login(username: string, password: string) {
        try {
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);

            const response = await axios.post(this.KEYCLOAK_TOKEN_URL, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in,
                tokenType: response.data.token_type,
            };
        } catch (err) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
