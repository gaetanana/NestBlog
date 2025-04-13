// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Patch, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles({ roles: ['admin'] })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;

    if (currentUser?.realm_access?.roles.includes('user') && currentUser.sub !== id) {
      throw new ForbiddenException("You can only access your own profile.");
    }

    // 🔁 Si l'utilisateur n'existe pas encore dans la BDD, on le crée depuis Keycloak
    return this.usersService.findOrCreateFromKeycloak(currentUser);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
