<script setup lang="ts">
import { useUser } from '@/db'
import { ATypography } from 'anu-vue'

const { user } = useUser()
</script>
<template>
  <div class="px-3 py-2 class flex flex-col">
    <a-typography
      :title="`Hello ${user?.displayName}`"
      subtitle="Welcome to noter. Create a board from the sidebar to get started."
    />
  </div>
</template>
