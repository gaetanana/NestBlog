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
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module'; // Nouveau module

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',
      realm: 'NestBlog',
      clientId: 'nestblog-backend',
      secret: 'peCGb3FZtMUm7bU7As0OPbkXNY98r2hT',
      bearerOnly: true,
      logLevels: ['verbose'],
    }),
    UsersModule,
    AuthModule,
    RolesModule, 
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
export class AppModule {}
