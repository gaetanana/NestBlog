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
      user = await this.prisma.user.create({
        data: {
          id: keycloakUser.sub,
          username: keycloakUser.preferred_username,
          email: keycloakUser.email,
          name:
            keycloakUser.name ||
            `${keycloakUser.given_name || ''} ${keycloakUser.family_name || ''}`.trim(),
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
