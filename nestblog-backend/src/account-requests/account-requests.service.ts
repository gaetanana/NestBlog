import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserManagementService } from '../users/user-management.service';

@Injectable()
export class AccountRequestsService {
  constructor(
    private prisma: PrismaService,
    private userManagementService: UserManagementService,
  ) {}

  async create(requestData: any) {
    return this.prisma.accountRequest.create({
      data: {
        username: requestData.username,
        email: requestData.email,
        firstName: requestData.firstName || '',
        lastName: requestData.lastName || '',
        reason: requestData.reason || '',
      },
    });
  }

  async findAll() {
    return this.prisma.accountRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending() {
    return this.prisma.accountRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, adminId: string) {
    const request = await this.prisma.accountRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Account request not found');
    }

    // Créer l'utilisateur dans Keycloak et dans la base de données
    try {
      await this.userManagementService.createUser({
        username: request.username,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        password: Math.random().toString(36).substring(2, 10), // Mot de passe temporaire aléatoire
        enabled: true,
        roles: ['user'], // Rôle par défaut
      });

      // Mettre à jour le statut de la demande
      return this.prisma.accountRequest.update({
        where: { id },
        data: {
          status: 'approved',
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  async reject(id: string) {
    return this.prisma.accountRequest.update({
      where: { id },
      data: {
        status: 'rejected',
      },
    });
  }
}