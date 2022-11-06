<script lang="ts">
import { inject, reactive } from 'vue'
import { nanoid } from 'nanoid'
import { useRouter } from 'vue-router'

interface BoardContext {
  status: 'saving' | 'saved'
  newBoard?: string
  setBoardStatus(status: BoardContext['status']): void
}

export const BOARD_CONTEXT_KEY = Symbol()

const boardContext = reactive<BoardContext>({
  status: 'saved',
  newBoard: undefined,
  setBoardStatus(status: BoardContext['status']) {
    boardContext.status = status
  }
})

export function useBoardContext() {
  const context = inject<BoardContext>(BOARD_CONTEXT_KEY)

  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider')
  }

  return context
}
</script>

<script setup lang="ts">
import { useUser } from '@/db'
import { useBoards } from '@/db/boards'
import { useAppState } from '@/store/app'
import { ABtn, ADrawer, AList, AMenu, ATypography } from 'anu-vue'
import { computed, provide } from 'vue'

const { user, signOut } = useUser()
const { drawerOpen, toggleDrawer } = useAppState()
const { boards, deleteBoard, dbStatus } = useBoards()
const router = useRouter()

const avatarText = computed(() =>
  user.value?.displayName
    ?.split(' ')
    .map((v) => v[0])
    .join('')
)

const profileMenu = [
  {
    label: 'Home',
    icon: 'i-ph-house-bold',
    onClick() {
      router.push('/user')
    }
  },

  {
    label: 'Log out',
    icon: 'i-ph-sign-out-bold',
    onClick: signOut
  }
]

const boardsForSidebar = computed(() =>
  boards.value.map((board) => ({
    key: board.key,
    label: board.meta.name,
    cover: board.meta.cover
  }))
)

function handleBoardOpen(id: string) {
  boardContext.newBoard = undefined
  router.push(`/${id}`)
  toggleDrawer()
}

async function handleCreateBoard() {
  toggleDrawer()

  boardContext.newBoard = nanoid(16)

  await router.push(`/${boardContext.newBoard}`)
}

provide(BOARD_CONTEXT_KEY, boardContext)
</script>
<template>
  <main class="min-h-screen flex flex-col gap-2 text-black">
    <nav
      class="sticky top-0 z-50 flex gap-2 items-center justify-between p-2 bg-zinc-900 border-b border-zinc-700"
    >
      <div class="flex items-center gap-2">
        <a-btn class="text-sm" variant="text">
          <a-menu>
            <a-list variant="light" :items="profileMenu as any">
              <li v-for="action in profileMenu" :key="action.label">
                <a-btn
                  class="text-xs"
                  variant="text"
                  :icon="action.icon"
                  @click="action.onClick"
                  >{{ action.label }}</a-btn
                >
              </li>
            </a-list>
          </a-menu>

          {{ avatarText }}
        </a-btn>

        <a-btn
          icon-only
          class="text-xs"
          icon="i-ph-caret-double-right-bold"
          @click="toggleDrawer"
          variant="text"
        />
      </div>

      <div
        class="text-sm text-zinc-400 flex items-center gap-2"
        v-if="$route.name === 'board' && dbStatus === 'stale'"
      >
        <span
          v-if="boardContext.newBoard !== undefined"
          class="i-ph-circle-wavy-warning-bold text-red-500"
        />
        <span
          v-else-if="boardContext.status === 'saving'"
          class="i-ph-spinner-bold text-orange-400"
        />
        <span v-else class="i-ph-check-circle-bold text-green-400" />

        <span class="first-letter:capitalize">
          {{
            boardContext.newBoard !== undefined
              ? 'Not saved'
              : boardContext.status
          }}
        </span>
      </div>
    </nav>

    <a-drawer v-model="drawerOpen">
      <div class="card-body flex flex-col gap-2">
        <div
          class="sticky top-0 z-50 pb-6 flex items-center justify-between border-b border-zinc-700"
        >
          <a-typography
            :title="user?.displayName as string"
            :subtitle="user?.email as string"
          />

          <a-btn
            class="text-xs"
            icon="i-ph-sign-out-bold"
            variant="text"
            @click="signOut"
            >Log out</a-btn
          >
        </div>

        <div class="text-base">My boards</div>

        <a-btn
          icon="i-ph-plus-bold"
          class="text-sm w-full !justify-start"
          variant="text"
          @click="handleCreateBoard"
        >
          Add a new board
        </a-btn>

        <a-list variant="light" :items="[{title:''}] as any">
          <li
            class="flex items-center gap-2 justify-between"
            v-for="board in boardsForSidebar"
            :key="board.key"
          >
            <a-btn
              class="text-sm !justify-start flex-grow"
              variant="text"
              @click="handleBoardOpen(board.key)"
              :title="board.label"
            >
              <span>{{ board.cover }}</span>

              <span class="truncate max-w-[180px]">
                {{ board.label }}
              </span>
            </a-btn>

            <a-btn
              icon-only
              icon="i-ph-trash-bold"
              class="text-sm"
              variant="text"
              @click="deleteBoard(board.key)"
            />
          </li>
        </a-list>
      </div>
    </a-drawer>

    <router-view />
  </main>
</template>
