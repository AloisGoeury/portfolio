import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './auth.dto';

interface UserRow extends QueryResultRow {
    id: string;
    email: string;
    password_hash: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly database: DatabaseService,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDto): Promise<{ accessToken: string }> {
        const result = await this.database.query<UserRow>(
            `SELECT id, email, password_hash, role
       FROM users
       WHERE email = $1`,
            [dto.email.trim().toLowerCase()],
        );
        const user = result.rows[0];

        if (
            !user ||
            !(await bcrypt.compare(dto.password, user.password_hash))
        ) {
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return { accessToken };
    }
}
