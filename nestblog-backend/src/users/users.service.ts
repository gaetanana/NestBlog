// src/users/users.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { User } from '@prisma/client';
import * as ldap from 'ldapjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private ldapClient: ldap.Client;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.ldapClient = ldap.createClient({
      url: this.config.get<string>('LDAP_URL'),
    });
  }

  private getUserDN(username: string) {
    return `uid=${username},${process.env.LDAP_BASE_DN}`;
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({ data });

    const entry = {
      cn: data.name || data.username,
      sn: data.name || data.username,
      uid: data.username,
      mail: data.email,
      objectClass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
      userPassword: data.password,
    };

    return new Promise((resolve, reject) => {
      this.ldapClient.add(this.getUserDN(data.username), entry, (err) => {
        if (err) {
          console.error('LDAP create error:', err);
          return reject(new InternalServerErrorException('LDAP user creation failed'));
        }
        resolve(user);
      });
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOrCreateFromKeycloak(payload: any): Promise<User> {
    const id = payload.sub;

    let user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: payload.sub,
          username: payload.preferred_username,
          email: payload.email,
          name: payload.name,
          password: '', // car on utilise LDAP
        },
      });
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({ where: { id }, data });

    const changes: ldap.Change[] = [];
    if (data.email)
      changes.push(new ldap.Change({ operation: 'replace', modification: { mail: data.email } }));
    if (data.password)
      changes.push(new ldap.Change({ operation: 'replace', modification: { userPassword: data.password } }));
    if (data.username)
      changes.push(new ldap.Change({ operation: 'replace', modification: { uid: data.username } }));

    return new Promise((resolve, reject) => {
      this.ldapClient.modify(this.getUserDN(user.username), changes, (err) => {
        if (err) {
          console.error('LDAP update error:', err);
          return reject(new InternalServerErrorException('LDAP user update failed'));
        }
        resolve(updated);
      });
    });
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    const deleted = await this.prisma.user.delete({ where: { id } });

    return new Promise((resolve, reject) => {
      this.ldapClient.del(this.getUserDN(user.username), (err) => {
        if (err) {
          console.error('LDAP delete error:', err);
          return reject(new InternalServerErrorException('LDAP user deletion failed'));
        }
        resolve(deleted);
      });
    });
  }
}
