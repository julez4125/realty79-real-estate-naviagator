import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  const tenantId = 'default';

  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Default Tenant',
      email: 'admin@localhost',
      plan: 'self-hosted',
    },
  });

  // Property has no tenantId yet — seed example properties for the M0.5 portfolio UI.
  const samples = [
    {
      source: 'manual',
      sourceUrl: 'https://example.invalid/listings/1',
      kaufpreis: 250_000,
      preisProQm: 3205,
      baujahr: 1985,
      wohnflaeche: 78,
      zimmer: 3,
      plz: '79539',
      ort: 'Lörrach',
    },
    {
      source: 'manual',
      sourceUrl: 'https://example.invalid/listings/2',
      kaufpreis: 320_000,
      preisProQm: 3200,
      baujahr: 1998,
      wohnflaeche: 100,
      zimmer: 4,
      plz: '79576',
      ort: 'Weil am Rhein',
    },
    {
      source: 'manual',
      sourceUrl: 'https://example.invalid/listings/3',
      kaufpreis: 180_000,
      preisProQm: 2571,
      baujahr: 1972,
      wohnflaeche: 70,
      zimmer: 2.5,
      plz: '79618',
      ort: 'Rheinfelden',
    },
    {
      source: 'manual',
      sourceUrl: 'https://example.invalid/listings/4',
      kaufpreis: 410_000,
      preisProQm: 3933,
      baujahr: 2005,
      wohnflaeche: 104,
      zimmer: 4,
      plz: '79650',
      ort: 'Schopfheim',
    },
    {
      source: 'manual',
      sourceUrl: 'https://example.invalid/listings/5',
      kaufpreis: 155_000,
      preisProQm: 2214,
      baujahr: 1965,
      wohnflaeche: 70,
      zimmer: 3,
      plz: '79677',
      ort: 'Häg-Ehrsberg',
    },
  ];

  for (const data of samples) {
    await prisma.property.create({ data });
  }

  console.log(`Seeded ${samples.length} properties for tenant '${tenantId}'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
