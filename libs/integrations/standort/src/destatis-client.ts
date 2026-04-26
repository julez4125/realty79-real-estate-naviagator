import { z } from 'zod';

export const PopulationTrendSchema = z.object({
  plz: z.string(),
  year: z.number(),
  population: z.number(),
  trend: z.enum(['growing', 'stable', 'shrinking']),
});

export type PopulationTrend = z.infer<typeof PopulationTrendSchema>;

/**
 * Client for the Destatis (Federal Statistical Office) API.
 * Provides population trend data by PLZ (postcode area).
 *
 * TODO M3: implement HTTP fetch with auth, zod validation, caching, and
 * rate-limit back-off. Map Destatis regional keys to PLZ.
 */
export class DestatisClient {
  /**
   * Fetches population trend data for the given PLZ.
   */
  async populationTrend(_plz: string): Promise<PopulationTrend> {
    throw new Error('DestatisClient.populationTrend not yet implemented — see M3');
  }
}
