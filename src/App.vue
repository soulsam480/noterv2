<script lang="ts" setup></script>

<template>
  <router-view
    :key="
      $route.name === 'board'
        ? JSON.stringify($route.params.boardId)
        : undefined
    "
  />
</template>
