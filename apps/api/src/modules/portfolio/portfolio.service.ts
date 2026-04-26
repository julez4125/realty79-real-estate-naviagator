import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface PortfolioOverview {
  propertyCount: number;
  kaufpreisSum: number;
  kaltmieteSum: number;
  avgPreisProQm: number;
  plzList: string[];
}

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<PortfolioOverview> {
    const [agg, plzRows] = await Promise.all([
      this.prisma.property.aggregate({
        _count: { id: true },
        _sum: { kaufpreis: true, kaltmieteIst: true },
        _avg: { preisProQm: true },
      }),
      this.prisma.property.findMany({
        select: { plz: true },
        distinct: ['plz'],
      }),
    ]);

    return {
      propertyCount: agg._count.id,
      kaufpreisSum: agg._sum.kaufpreis ?? 0,
      kaltmieteSum: agg._sum.kaltmieteIst ?? 0,
      avgPreisProQm: agg._avg.preisProQm ?? 0,
      plzList: plzRows.map((r) => r.plz),
    };
  }
}
