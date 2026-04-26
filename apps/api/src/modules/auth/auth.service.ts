import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

/** Minimal shape of the User record returned by Prisma (before full codegen). */
interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  tenantId: string | null;
}

/** Delegate type for prisma.user once the User model is generated. */
interface UserDelegate {
  findUnique(args: { where: { id?: string; email?: string } }): Promise<UserRecord | null>;
  create(args: { data: { email: string; passwordHash: string; tenantId: string | null } }): Promise<UserRecord>;
}

/** Extended prisma client type that includes the User model delegate. */
interface PrismaWithUser {
  user: UserDelegate;
}

@Injectable()
export class AuthService {
  private get userDb(): UserDelegate {
    return (this.prisma as unknown as PrismaWithUser).user;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.userDb.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.userDb.create({
      data: {
        email: dto.email,
        passwordHash,
        tenantId: dto.tenantId ?? null,
      },
    });

    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userDb.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens({ sub: user.id, email: user.email });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: process.env['JWT_SECRET'],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify user still exists
    const user = await this.userDb.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens({ sub: user.id, email: user.email });
  }

  private issueTokens(payload: JwtPayload): AuthTokens {
    const accessToken = this.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
      secret: process.env['JWT_SECRET'],
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
      secret: process.env['JWT_SECRET'],
    });
    return { accessToken, refreshToken };
  }
}
