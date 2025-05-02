//  src/users/users.service.ts simplifié
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findOrCreateFromKeycloak(keycloakUser: any): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: { id: keycloakUser.sub },
    });

    if (!user) {
      // Format the name properly
      let formattedName = keycloakUser.name;

      // If there's no name but there are first and last names
      if (
        !formattedName &&
        (keycloakUser.given_name || keycloakUser.family_name)
      ) {
        formattedName =
          `${keycloakUser.given_name || ''} ${keycloakUser.family_name || ''}`.trim();
      }

      // Use username as fallback
      if (!formattedName) {
        formattedName = keycloakUser.preferred_username;
      }

      user = await this.prisma.user.create({
        data: {
          id: keycloakUser.sub,
          username: keycloakUser.preferred_username,
          email: keycloakUser.email,
          name: formattedName,
        },
      });
    }

    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
