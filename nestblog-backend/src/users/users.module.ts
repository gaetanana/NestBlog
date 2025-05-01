// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserManagementService } from './user-management.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserManagementService],
  exports: [UsersService, UserManagementService],
})
export class UsersModule {}