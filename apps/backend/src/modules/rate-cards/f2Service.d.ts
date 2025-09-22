import type { AuditLogger } from '../../lib/audit-logger.drizzle.js';
import type { CreateRateCard, UpdateRateCard, CreateService, UpdateService, RateCardResponse, ServiceResponse, RateCardListQuery, RateCardListResponse } from './f2Schemas.js';
export interface F2RateCardContext {
    organizationId: string;
    tenantId: string;
    userId: string;
}
export declare class F2RateCardService {
    private context;
    private auditLogger?;
    private db;
    constructor(context: F2RateCardContext, auditLogger?: AuditLogger | undefined);
    getAllRateCards(query?: RateCardListQuery): Promise<RateCardListResponse>;
    getRateCard(id: string): Promise<RateCardResponse | null>;
    createRateCard(data: CreateRateCard): Promise<RateCardResponse>;
    updateRateCard(id: string, data: UpdateRateCard): Promise<RateCardResponse | null>;
    deleteRateCard(id: string): Promise<boolean>;
    createService(rateCardId: string, data: CreateService): Promise<ServiceResponse>;
    updateService(rateCardId: string, serviceId: string, data: UpdateService): Promise<ServiceResponse | null>;
    deleteService(rateCardId: string, serviceId: string): Promise<boolean>;
    getService(rateCardId: string, serviceId: string): Promise<ServiceResponse | null>;
    private formatRateCardResponse;
    private formatServiceResponse;
}
//# sourceMappingURL=f2Service.d.ts.map