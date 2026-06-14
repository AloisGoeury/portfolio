import '../load-env';
import bcrypt from 'bcrypt';
import { DatabaseService } from './database.service';
import { seedPageContent } from './seed-page-content';

async function seedDatabase(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const database = new DatabaseService();

  try {
    const pageCreated = await seedPageContent(database);
    console.log(
      pageCreated
        ? 'Initial about page created.'
        : 'About page already exists.',
    );

    if (!email || !password) {
      console.log(
        'ADMIN_EMAIL or ADMIN_PASSWORD is missing; admin seed skipped.',
      );
      return;
    }

    const existing = await database.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (existing.rowCount) {
      console.log(`Admin ${email} already exists.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await database.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      [email, passwordHash, 'ADMIN'],
    );
    console.log(`Admin ${email} created.`);
  } finally {
    await database.onModuleDestroy();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
