import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private _user: any;
    private _accountRequest: any;
    public get accountRequest(): any {
        return this._accountRequest;
    }
    public set accountRequest(value: any) {
        this._accountRequest = value;
    }
    public get user(): any {
        return this._user;
    }
    public set user(value: any) {
        this._user = value;
    }
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

    