import 'dotenv/config';
import bcrypt from 'bcrypt';
import { DatabaseService } from './database.service';

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      'ADMIN_EMAIL or ADMIN_PASSWORD is missing; admin seed skipped.',
    );
    return;
  }

  const database = new DatabaseService();

  try {
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

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
