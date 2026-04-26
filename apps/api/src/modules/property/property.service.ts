import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Property } from '@prisma/client';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Property[]> {
    return this.prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  findOne(id: string): Promise<Property | null> {
    return this.prisma.property.findUnique({ where: { id } });
  }
}
