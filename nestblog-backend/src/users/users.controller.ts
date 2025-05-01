// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Delete,
  Req,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles, Public, AuthenticatedUser } from 'nest-keycloak-connect';
import { UserManagementService } from './user-management.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userManagementService: UserManagementService,
  ) {}

  @Get()
  @Roles({ roles: ['admin'] })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getCurrentUser(@AuthenticatedUser() user: any) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.userManagementService.getCurrentUserProfile(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @AuthenticatedUser() user: any) {
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException('You can only access your own profile');
    }

    try {
      if (isAdmin) {
        return this.usersService.findOne(id);
      }

      return this.userManagementService.getCurrentUserProfile(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        if (isOwnProfile) {
          return this.userManagementService.findOrCreateFromKeycloak(user);
        }
        throw error;
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateAppData(
    @Param('id') id: string,
    @Body() data: any,
    @AuthenticatedUser() user: any,
  ) {
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.updateAppData(id, data);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  async removeFromApp(@Param('id') id: string) {
    return this.usersService.removeFromApp(id);
  }

  @Patch(':id/identity')
  async updateUserIdentity(
    @Param('id') id: string,
    @Body() userData: any,
    @AuthenticatedUser() user: any,
  ) {
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.userManagementService.updateUser(id, userData);
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() data: { password: string },
    @AuthenticatedUser() user: any,
  ) {
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException('You can only change your own password');
    }

    return this.userManagementService.changePassword(id, data.password);
  }
}
