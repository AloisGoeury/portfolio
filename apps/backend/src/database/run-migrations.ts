import '../load-env';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseService } from './database.service';

async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing.');
  }

  const target = new URL(databaseUrl);
  console.log(
    `Migration target: ${target.hostname}:${target.port || '5432'}${target.pathname}`,
  );

  const database = new DatabaseService();
  const migrationsDirectory = join(__dirname, '..', '..', 'db', 'migrations');

  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        executed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const filenames = (await readdir(migrationsDirectory))
      .filter((filename) => filename.endsWith('.sql'))
      .sort();

    for (const filename of filenames) {
      const existing = await database.query<{ filename: string }>(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [filename],
      );

      if (existing.rowCount) {
        console.log(`Skipping ${filename}`);
        continue;
      }

      const sql = await readFile(join(migrationsDirectory, filename), 'utf8');
      await database.transaction(async (client) => {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [filename],
        );
      });
      console.log(`Applied ${filename}`);
    }
  } finally {
    await database.onModuleDestroy();
  }
}

runMigrations().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
