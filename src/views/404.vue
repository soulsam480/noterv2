<script lang="ts" setup>
import { ABtn } from 'anu-vue'
</script>

<template>
  <div class="flex flex-col text-zinc-50">
    <nav
      class="flex gap-2 items-center p-2 bg-zinc-900 border-b border-zinc-700 text-white"
    >
      <div>Noter</div>
    </nav>

    <div
      class="px-3 py-2 flex flex-col items-center gap-3 justify-center my-10"
    >
      <div class="text-3xl">Not Found</div>
      <a-btn
        @click="$router.push('/user')"
        variant="outline"
        icon="i-ph-house-bold"
        >Go home</a-btn
      >
    </div>
  </div>
</template>
