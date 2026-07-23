import { Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessException, UserErrors } from '../../common/exceptions/business.exception';
import { RegisterDto, LoginDto, PageQueryDto, RealnameAuthDto, BanUserDto, UnbanUserDto, UpdateProfileDto } from '../../common/dto';
import { mapUser } from '../../common/utils/mapper';

const MAX_PROMO_LEVEL = 5;

type Tx = Prisma.TransactionClient;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new BusinessException(UserErrors.USERNAME_EXISTS, 'Username already exists', HttpStatus.CONFLICT);
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: dto.username,
          password_hash,
          status: 'NORMAL',
        },
      });

      await tx.wallet.create({
        data: { user_id: user.id, type: 'BALANCE' },
      });

      const inviteCode = this.generateInviteCode();
      await tx.promotionLink.create({
        data: { user_id: user.id, invite_code: inviteCode, status: 'ACTIVE' },
      });

      if (dto.invite_code) {
        await this.bindPromotion(tx, user.id, dto.invite_code);
      }

      return mapUser(user);
    });
  }

  private async bindPromotion(tx: Tx, userId: number, inviteCode: string) {
    const link = await tx.promotionLink.findUnique({ where: { invite_code: inviteCode } });
    if (!link || link.status !== 'ACTIVE') {
      throw new BusinessException(UserErrors.INVALID_INVITE_CODE, 'Invalid invite code');
    }

    const parentRelation = await tx.userRelation.findUnique({ where: { user_id: link.user_id } });
    const parentLevel = parentRelation?.level ?? 0;

    if (parentLevel >= MAX_PROMO_LEVEL) {
      // 超层级：绑定到第 MAX 级用户本身，不再向上延伸
      await tx.userRelation.create({
        data: {
          user_id: userId,
          parent_user_id: link.user_id,
          level: MAX_PROMO_LEVEL,
          path: parentRelation?.path ?? String(link.user_id),
        },
      });
      return;
    }

    const newLevel = parentLevel + 1;
    const path = parentRelation ? `${parentRelation.path}/${link.user_id}` : String(link.user_id);

    await tx.userRelation.create({
      data: {
        user_id: userId,
        parent_user_id: link.user_id,
        level: newLevel,
        path,
      },
    });
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new BusinessException(UserErrors.INVALID_CREDENTIALS, 'Invalid username or password', HttpStatus.UNAUTHORIZED);
    }
    if (user.status !== 'NORMAL') {
      throw new BusinessException(UserErrors.USER_DISABLED, 'User is disabled', HttpStatus.FORBIDDEN);
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw new BusinessException(UserErrors.INVALID_CREDENTIALS, 'Invalid username or password', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BusinessException(UserErrors.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: id } });
    return {
      ...mapUser(user),
      realname_status: realname?.auth_status,
      real_name: realname?.auth_status === 'APPROVED' ? realname.real_name : undefined,
    };
  }

  async submitRealname(userId: number, dto: RealnameAuthDto) {
    const idCard = dto.id_card.trim().toUpperCase();
    if (!/^(\d{15}|\d{17}[\dX])$/.test(idCard)) {
      throw new BusinessException('INVALID_ID_CARD', 'Invalid ID card number', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
    if (existing?.auth_status === 'APPROVED') {
      throw new BusinessException('REALNAME_ALREADY_APPROVED', 'Already verified', HttpStatus.CONFLICT);
    }

    const record = await this.prisma.realnameAuth.upsert({
      where: { user_id: userId },
      update: {
        real_name: dto.real_name.trim(),
        id_card: idCard,
        auth_status: 'APPROVED',
      },
      create: {
        user_id: userId,
        real_name: dto.real_name.trim(),
        id_card: idCard,
        auth_status: 'APPROVED',
      },
    });

    return {
      auth_status: record.auth_status,
      real_name: record.real_name,
    };
  }

  async getRealname(userId: number) {
    const record = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
    if (!record) {
      return { auth_status: 'NONE' };
    }
    return {
      auth_status: record.auth_status,
      real_name: record.auth_status === 'APPROVED' ? record.real_name : undefined,
      created_at: record.created_at.toISOString(),
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(UserErrors.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.email !== undefined ? { email: dto.email || null } : {}),
        ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number || null } : {}),
        ...(dto.avatar_url !== undefined ? { avatar_url: dto.avatar_url || null } : {}),
      },
    });
    return mapUser(updated);
  }

  async listAdmin(params: {
    page?: number;
    page_size?: number;
    username?: string;
    keyword?: string;
    user_id?: number;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const keyword = params.keyword?.trim() || params.username?.trim();
    const where: Prisma.UserWhereInput = {
      ...(params.user_id ? { id: Number(params.user_id) } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(keyword
        ? {
            OR: [
              { username: { contains: keyword } },
              { phone_number: { contains: keyword } },
              { email: { contains: keyword } },
            ],
          }
        : {}),
    };
    const [total, records] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);

    const userIds = records.map((u) => u.id);
    const l1Groups = userIds.length
      ? await this.prisma.userRelation.groupBy({
          by: ['parent_user_id'],
          where: { parent_user_id: { in: userIds } },
          _count: { id: true },
        })
      : [];
    const l1Map = new Map(l1Groups.map((g) => [g.parent_user_id, g._count.id]));

    return {
      total,
      records: records.map((u) => ({
        user_id: u.id,
        username: u.username,
        phone_number: u.phone_number ?? undefined,
        email: u.email ?? undefined,
        status: u.status,
        created_at: u.created_at.toISOString(),
        promo_summary: { l1_count: l1Map.get(u.id) ?? 0 },
      })),
    };
  }

  async banUser(adminId: number, userId: number, dto: BanUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(UserErrors.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    const beforeStatus = user.status;
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: dto.mode },
      });
      await tx.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'USER_BAN',
          target_type: 'USER',
          target_id: userId,
          reason: dto.reason,
          before_data: JSON.stringify({ status: beforeStatus }),
          after_data: JSON.stringify({ status: dto.mode }),
        },
      });
    });
    return { status: 'success' };
  }

  async unbanUser(adminId: number, userId: number, dto: UnbanUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BusinessException(UserErrors.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }
    const beforeStatus = user.status;
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: 'NORMAL' },
      });
      await tx.auditLog.create({
        data: {
          admin_id: adminId,
          action: 'USER_UNBAN',
          target_type: 'USER',
          target_id: userId,
          reason: dto.reason,
          before_data: JSON.stringify({ status: beforeStatus }),
          after_data: JSON.stringify({ status: 'NORMAL' }),
        },
      });
    });
    return { status: 'success' };
  }

  private generateInviteCode() {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
