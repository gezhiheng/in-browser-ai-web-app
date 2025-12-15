<script setup lang="ts">
import type { AppLocale } from './i18n'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function setLocale(next: AppLocale) {
  locale.value = next
  localStorage.setItem('locale', next)
}
</script>

<template>
  <div>
    <div class="fixed right-4 top-4 z-50 flex items-center gap-2">
      <select
        :value="locale" class="rounded-md border border-input bg-background px-1 py-1 text-sm"
        @change="setLocale(($event.target as HTMLSelectElement).value as AppLocale)"
      >
        <option value="en">
          EN
        </option>
        <option value="zh">
          中文
        </option>
      </select>
    </div>
    <RouterView />
  </div>
</template>

<style scoped></style>
