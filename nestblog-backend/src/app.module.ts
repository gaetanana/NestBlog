import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  KeycloakConnectModule,
  AuthGuard,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',   
      realm: 'NestBlog',
      clientId: 'nestblog-backend',
      secret: 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT',
      bearerOnly: true,                         
      logLevels: ['verbose'],
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule { }
