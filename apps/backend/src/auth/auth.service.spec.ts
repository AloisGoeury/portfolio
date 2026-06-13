import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const database = {
    query: jest.fn(),
  } as unknown as DatabaseService;
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;
  const service = new AuthService(database, jwtService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes the email, compares the hash and returns a JWT', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [
        {
          id: 'user-id',
          email: 'admin@example.com',
          password_hash: passwordHash,
          role: 'ADMIN',
        },
      ],
      rowCount: 1,
    } as never);
    jest.mocked(jwtService.signAsync).mockResolvedValueOnce('signed-token');

    await expect(
      service.login({
        email: '  ADMIN@example.com ',
        password: 'correct-password',
      }),
    ).resolves.toEqual({ accessToken: 'signed-token' });

    expect(database.query).toHaveBeenCalledWith(expect.any(String), [
      'admin@example.com',
    ]);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
  });

  it('rejects an unknown user without signing a token', async () => {
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'incorrect-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
