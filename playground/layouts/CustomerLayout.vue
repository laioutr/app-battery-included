<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header with back button -->
    <div class="px-4 py-4">
      <button
        class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
        @click="$router.push('/customer')"
      >
        <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Customer Menu
      </button>
    </div>
    <!-- Main Content -->
    <div class="mx-auto max-w-4xl px-4 py-8">
      <div v-if="title" class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </div>
</template>
