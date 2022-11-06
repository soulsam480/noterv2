import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useAppState = createGlobalState(() => {
  const drawerOpen = ref(false)

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
  }

  return {
    drawerOpen,
    toggleDrawer
  }
})
