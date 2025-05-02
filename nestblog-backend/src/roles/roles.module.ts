import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { ConfigModule } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

@Module({
  imports: [
    ConfigModule,
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',
      realm: 'NestBlog',
      clientId: 'nestblog-backend',
      secret: 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT',
      bearerOnly: true,
      logLevels: ['verbose'],
    }),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
