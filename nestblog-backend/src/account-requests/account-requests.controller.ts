import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { AccountRequestsService } from './account-requests.service';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('account-requests')
export class AccountRequestsController {
  constructor(private readonly accountRequestsService: AccountRequestsService) {}

  @Public()
  @Post()
  async create(@Body() requestData: any) {
    return this.accountRequestsService.create(requestData);
  }

  @Get()
  @Roles({ roles: ['admin'] })
  async findAll() {
    return this.accountRequestsService.findAll();
  }

  @Get('pending')
  @Roles({ roles: ['admin'] })
  async findPending() {
    return this.accountRequestsService.findPending();
  }

  @Patch(':id/approve')
  @Roles({ roles: ['admin'] })
  async approve(@Param('id') id: string, @AuthenticatedUser() user: any) {
    return this.accountRequestsService.approve(id, user.sub);
  }

  @Patch(':id/reject')
  @Roles({ roles: ['admin'] })
  async reject(@Param('id') id: string) {
    return this.accountRequestsService.reject(id);
  }
}