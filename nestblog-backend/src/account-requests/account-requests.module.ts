import { Module } from '@nestjs/common';
import { AccountRequestsController } from './account-requests.controller';
import { AccountRequestsService } from './account-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserManagementService } from '../users/user-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccountRequestsController],
  providers: [AccountRequestsService, UserManagementService],
  exports: [AccountRequestsService],
})
export class AccountRequestsModule {}