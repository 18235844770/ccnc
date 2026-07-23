import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommissionService } from '../modules/commission/commission.service';
export declare const ORDER_EVENTS_QUEUE = "order-events";
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly commissionService;
    private readonly logger;
    private queue;
    private worker;
    private connection;
    constructor(config: ConfigService, commissionService: CommissionService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enqueueOrderPaid(orderId: number): Promise<{
        created: number;
        skipped?: undefined;
    } | {
        created: number;
        skipped: boolean;
    } | {
        queued: boolean;
    }>;
}
