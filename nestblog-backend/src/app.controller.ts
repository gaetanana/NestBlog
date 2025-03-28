import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser, Roles, Resource } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get('protected')
  @Roles({ roles: ['user'] }) 
  getProtected(@AuthenticatedUser() user: any) {
    return {
      message: 'Access granted',
      user,
    };
  }
}
