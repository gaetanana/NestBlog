// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /**
   * Trouve ou crée un utilisateur basé sur les informations Keycloak
   */
  async findOrCreateFromKeycloak(payload: any): Promise<User> {
    if (!payload || !payload.preferred_username) {
      throw new Error('Invalid Keycloak payload');
    }

    const keycloakId = payload.sub;
    const username = payload.preferred_username;

    // Recherche d'abord par username (constant)
    let user = await this.prisma.user.findUnique({ where: { username } });

    if (user) {
      // Si trouvé, mettre à jour l'ID pour correspondre au nouveau ID Keycloak
      if (user.id !== keycloakId) {
        console.log(
          `Updating user ID for ${username} from ${user.id} to ${keycloakId}`,
        );
        user = await this.prisma.user.update({
          where: { username },
          data: { id: keycloakId },
        });
      }
      return user;
    }

    // Si non trouvé, créer l'utilisateur
    console.log(`Creating new user from Keycloak: ${username}`);
    return this.prisma.user.create({
      data: {
        id: keycloakId,
        username: username,
        email: payload.email,
        name:
          payload.name || `${payload.given_name} ${payload.family_name}`.trim(),
        password: '',
      },
    });
  }
  /**
   * Récupère tous les utilisateurs (pour les administrateurs)
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Met à jour les données spécifiques à l'application d'un utilisateur
   * Note: Ce n'est pas une mise à jour d'identité, qui serait gérée par Keycloak/LDAP
   */
  async updateAppData(id: string, data: { [key: string]: any }): Promise<User> {
    // Vérifier si l'utilisateur existe
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('User not found');
  
    // Ne permettre la mise à jour que des champs spécifiques à l'application
    // Exclure explicitement les champs liés à l'identité et les champs qui ne font pas partie du modèle
    const { username, email, password, roles, ...appData } = data;
  
    return this.prisma.user.update({
      where: { id },
      data: appData,
    });
  }

  /**
   * Supprime un utilisateur de la base de données de l'application
   * Note: Cela ne supprime pas l'utilisateur de Keycloak/LDAP
   */
  async removeFromApp(id: string): Promise<User> {
    // Vérifier si l'utilisateur existe
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('User not found');

    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Récupère l'utilisateur actuel avec ses données complètes (pour profil utilisateur)
   */
  async getCurrentUserProfile(keycloakPayload: any): Promise<any> {
    const user = await this.findOrCreateFromKeycloak(keycloakPayload);

    // Ici, vous pouvez enrichir l'utilisateur avec des données supplémentaires
    // spécifiques à votre application
    const userData = {
      ...user,
      roles: keycloakPayload.realm_access?.roles || [],
      // Autres données spécifiques à l'application
    };

    return userData;
  }
}
