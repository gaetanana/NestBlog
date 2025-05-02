// Nouveau src/auth/auth.controller.ts avec registration
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'nest-keycloak-connect';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { usernameOrEmail: string; password: string }) {
    return this.authService.login(body.usernameOrEmail, body.password);
  }

  @Public()
  @Post('register')
  async register(@Body() userData: any) {
    return this.authService.register(userData);
  }
}
