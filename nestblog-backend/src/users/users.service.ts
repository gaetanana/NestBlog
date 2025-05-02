import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // CRUD basique pour PostgreSQL
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateAppData(id: string, data: { [key: string]: any }): Promise<User> {
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('User not found');

    // Exclure les champs d'identité
    const { username, email, password, roles, ...appData } = data;

    return this.prisma.user.update({
      where: { id },
      data: appData,
    });
  }

  async removeFromApp(id: string): Promise<User> {
    const userExists = await this.prisma.user.findUnique({ where: { id } });
    if (!userExists) throw new NotFoundException('User not found');

    return this.prisma.user.delete({ where: { id } });
  }

  // Méthode utilitaire pour créer un utilisateur dans PostgreSQL
  async createUserInDB(userData: {
    id: string;
    username: string;
    email: string;
    name?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...userData,
      },
    });
  }
}
