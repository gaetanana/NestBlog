// src/auth/auth.controller.ts - Fixed version
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'nest-keycloak-connect';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { usernameOrEmail: string; password: string }) {
    this.logger.log(`Login attempt for user: ${body.usernameOrEmail}`);
    return this.authService.login(body.usernameOrEmail, body.password);
  }

  @Public()
  @Post('register')
  async register(@Body() userData: any) {
    this.logger.log(`Registration attempt for user: ${userData.username}`);
    return this.authService.register(userData);
  }
}
