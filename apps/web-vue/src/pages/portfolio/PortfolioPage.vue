<template>
  <div class="portfolio-page">
    <h1 class="va-h1">Portfolio</h1>

    <va-inner-loading :loading="loading">
      <div v-if="error" class="va-text-danger">{{ error }}</div>

      <div class="portfolio-stats va-layout va-layout--gap">
        <va-card class="stat-card">
          <va-card-title>Objekte</va-card-title>
          <va-card-content>
            <span class="va-h3">{{ overview?.propertyCount ?? '—' }}</span>
          </va-card-content>
        </va-card>

        <va-card class="stat-card">
          <va-card-title>Kaufpreis gesamt</va-card-title>
          <va-card-content>
            <span class="va-h3">{{ formatEur(overview?.kaufpreisSum) }}</span>
          </va-card-content>
        </va-card>

        <va-card class="stat-card">
          <va-card-title>Kaltmiete gesamt</va-card-title>
          <va-card-content>
            <span class="va-h3">{{ formatEur(overview?.kaltmieteSum) }}</span>
          </va-card-content>
        </va-card>

        <va-card class="stat-card">
          <va-card-title>Ø Preis/m²</va-card-title>
          <va-card-content>
            <span class="va-h3">{{ formatEur(overview?.avgPreisProQm) }}</span>
          </va-card-content>
        </va-card>
      </div>

      <va-card class="mt-4">
        <va-card-title>Top 5 Objekte</va-card-title>
        <va-card-content>
          <va-data-table
            :items="topProperties"
            :columns="columns"
          />
        </va-card-content>
      </va-card>
    </va-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { PropertyDto, PortfolioOverviewDto } from '@org/shared';
import { getOverview } from '@/services/api/portfolio';
import { listProperties } from '@/services/api/properties';

const loading = ref(false);
const error = ref<string | null>(null);
const overview = ref<PortfolioOverviewDto | null>(null);
const properties = ref<PropertyDto[]>([]);

const topProperties = computed(() => properties.value.slice(0, 5));

const columns = [
  { key: 'ort', label: 'Ort' },
  { key: 'plz', label: 'PLZ' },
  { key: 'kaufpreis', label: 'Kaufpreis' },
  { key: 'wohnflaeche', label: 'Wohnfläche (m²)' },
  { key: 'zimmer', label: 'Zimmer' },
  { key: 'preisProQm', label: 'Preis/m²' },
];

function formatEur(value?: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    [overview.value, properties.value] = await Promise.all([
      getOverview(),
      listProperties(),
    ]);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Fehler beim Laden';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.portfolio-page {
  padding: 1.5rem;
}
.portfolio-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.mt-4 {
  margin-top: 1.5rem;
}
</style>
