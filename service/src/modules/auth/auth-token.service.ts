import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface UserJwtPayload {
  sub: number;
  username: string;
  type: 'user';
}

export interface AdminJwtPayload {
  sub: number;
  username: string;
  type: 'admin';
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signUser(payload: Omit<UserJwtPayload, 'type'>) {
    return this.jwt.sign(
      { ...payload, type: 'user' },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '7d'),
      },
    );
  }

  signAdmin(payload: Omit<AdminJwtPayload, 'type'>) {
    return this.jwt.sign(
      { ...payload, type: 'admin' },
      {
        secret: this.config.get<string>('JWT_ADMIN_SECRET') || this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '7d'),
      },
    );
  }
}
