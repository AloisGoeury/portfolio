import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export type DatabaseClient = Pick<PoolClient, 'query'>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly useSsl =
        process.env.DATABASE_SSL === 'true' ||
        process.env.NODE_ENV === 'production';

    private readonly pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: this.useSsl ? { rejectUnauthorized: false } : undefined,
    });

    query<T extends QueryResultRow>(
        text: string,
        params: readonly unknown[] = [],
    ): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, [...params]);
    }

    async transaction<T>(
        callback: (client: DatabaseClient) => Promise<T>,
    ): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.end();
    }
}
