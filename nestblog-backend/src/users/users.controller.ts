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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Récupère tous les utilisateurs (réservé aux administrateurs)
   */
  @Get()
  @Roles({ roles: ['admin'] })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  @Get('me')
  async getCurrentUser(@AuthenticatedUser() user: any) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.usersService.getCurrentUserProfile(user);
  }

  /**
   * Récupère un utilisateur par son ID
   * Les utilisateurs normaux ne peuvent voir que leur propre profil
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @AuthenticatedUser() user: any) {
    // Vérifier les permissions - admin peut tout voir, utilisateur ne peut voir que son profil
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException("You can only access your own profile");
    }

    try {
      // Pour les admins, on peut récupérer directement depuis la base de données
      if (isAdmin) {
        return this.usersService.findOne(id);
      }

      // Pour l'utilisateur normal, on utilise son propre profil (avec données enrichies)
      return this.usersService.getCurrentUserProfile(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Cas spécial: si l'utilisateur est dans Keycloak mais pas encore dans notre BD
        if (isOwnProfile) {
          return this.usersService.findOrCreateFromKeycloak(user);
        }
        throw error;
      }
      throw error;
    }
  }

  /**
   * Met à jour les données spécifiques à l'application d'un utilisateur
   * Les champs liés à l'identité (username, email, password) sont ignorés
   */
  @Patch(':id')
  async updateAppData(
    @Param('id') id: string,
    @Body() data: any,
    @AuthenticatedUser() user: any,
  ) {
    // Vérifier les permissions
    const isAdmin = user?.realm_access?.roles?.includes('admin');
    const isOwnProfile = user?.sub === id;

    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenException("You can only update your own profile");
    }

    return this.usersService.updateAppData(id, data);
  }

  /**
   * Supprime un utilisateur de la base de données de l'application
   * (Ne supprime pas l'utilisateur de Keycloak/LDAP)
   */
  @Delete(':id')
  @Roles({ roles: ['admin'] })
  async removeFromApp(@Param('id') id: string) {
    return this.usersService.removeFromApp(id);
  }
}