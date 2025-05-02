import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { Roles, Resource, AuthGuard, RoleGuard } from 'nest-keycloak-connect';
import { RolesService } from './roles.service';

@Controller('roles')
@Resource('roles')
@UseGuards(AuthGuard, RoleGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles({ roles: ['admin'] })
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get(':name')
  @Roles({ roles: ['admin'] })
  async getRoleByName(@Param('name') name: string) {
    return this.rolesService.getRoleByName(name);
  }
}
