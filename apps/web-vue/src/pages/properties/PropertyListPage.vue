<template>
  <div class="property-list-page">
    <h1 class="va-h1">Objekte</h1>

    <va-inner-loading :loading="loading">
      <div v-if="error" class="va-text-danger">{{ error }}</div>

      <va-data-table
        :items="properties"
        :columns="columns"
        striped
      />
    </va-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PropertyDto } from '@org/shared';
import { listProperties } from '@/services/api/properties';

const loading = ref(false);
const error = ref<string | null>(null);
const properties = ref<PropertyDto[]>([]);

const columns = [
  { key: 'ort', label: 'Ort' },
  { key: 'plz', label: 'PLZ' },
  { key: 'kaufpreis', label: 'Kaufpreis' },
  { key: 'wohnflaeche', label: 'Wohnfläche (m²)' },
  { key: 'zimmer', label: 'Zimmer' },
  { key: 'preisProQm', label: 'Preis/m²' },
  { key: 'source', label: 'Quelle' },
];

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    properties.value = await listProperties();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Fehler beim Laden';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.property-list-page {
  padding: 1.5rem;
}
</style>
