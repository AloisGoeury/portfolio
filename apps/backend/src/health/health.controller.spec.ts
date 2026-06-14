import { HealthController } from './health.controller';

describe('HealthController', () => {
    it('returns an OK status with an ISO timestamp', () => {
        const result = new HealthController().getHealth();

        expect(result.status).toBe('ok');
        expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
});
