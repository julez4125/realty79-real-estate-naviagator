import { z } from 'zod';

export const RegionalStatsSchema = z.object({
  plz: z.string(),
  purchasePriceIndexYoY: z.number().nullable(),
  vacancyRate: z.number().nullable(),
  avgRentEurM2: z.number().nullable(),
  infrastructureScore: z.number().nullable(),
});

export type RegionalStats = z.infer<typeof RegionalStatsSchema>;

/**
 * Client for the Regiostat regional statistics API.
 * Provides real-estate market metrics by PLZ.
 *
 * TODO M3: implement HTTP fetch with zod validation, caching, and
 * rate-limit back-off. Handle partial-data responses gracefully.
 */
export class RegiostatClient {
  /**
   * Fetches regional real-estate statistics for the given PLZ.
   */
  async regionalStats(_plz: string): Promise<RegionalStats> {
    throw new Error('RegiostatClient.regionalStats not yet implemented — see M3');
  }
}
