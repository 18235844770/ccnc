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
export declare class AuthTokenService {
    private readonly jwt;
    private readonly config;
    constructor(jwt: JwtService, config: ConfigService);
    signUser(payload: Omit<UserJwtPayload, 'type'>): string;
    signAdmin(payload: Omit<AdminJwtPayload, 'type'>): string;
}
