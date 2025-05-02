// Nouveau src/users/users.controller.ts simplifié
import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedUser, Roles, Public } from 'nest-keycloak-connect';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles({ roles: ['admin'] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: any,
  ): Promise<User> {
    // Si ce n'est pas un admin et pas l'utilisateur lui-même, on rejette
    if (!user.realm_access?.roles?.includes('admin') && user.sub !== id) {
      throw new UnauthorizedException('You can only view your own profile');
    }
    return this.usersService.findOne(id);
  }

  @Get('me')
  async getProfile(@AuthenticatedUser() user: any): Promise<User> {
    return this.usersService.findOrCreateFromKeycloak(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @AuthenticatedUser() user: any,
  ): Promise<User> {
    // Si ce n'est pas un admin et pas l'utilisateur lui-même, on rejette
    if (!user.realm_access?.roles?.includes('admin') && user.sub !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
