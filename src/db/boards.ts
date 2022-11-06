import { useBoardContext } from '@/layouts/WithNav.vue'
import type { Board } from '@/types'
import { createSharedComposable } from '@vueuse/core'
import {
  DataSnapshot,
  getDatabase,
  onValue,
  ref as getDbRef,
  remove,
  update as updateDoc
} from 'firebase/database'
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { app, useUser } from '.'

const BOARD_DEFAULT = {
  data: {
    blocks: [
      {
        data: {
          level: 6,
          text: "<mark class ='cdx-marker'>Guide/</mark>"
        },
        type: 'header'
      },
      {
        data: {
          items: [
            "<mark class ='cdx-marker'><b>Click anywhere to add content</b></mark>",
            "<mark class ='cdx-marker'><b>Hit tab for block types</b></mark>",
            "<mark class ='cdx-marker'><b>Saved automatically on typing! </b></mark>",
            "<mark class ='cdx-marker'><b>Ctrl/Cmd + S to force save</b></mark>"
          ],
          style: 'ordered'
        },
        type: 'list'
      }
    ],
    version: '2.18.0'
  },
  meta: {
    name: 'Untitled',
    cover: '🔰',
    coverBg: {
      background:
        'linear-gradient(90deg, #71f7bd 25%, #e2a8f7 50%, #8077e5 75%)'
    }
  }
}

function useBoardsBase() {
  const boards = ref<Board[]>([])
  const { user } = useUser()
  const dbStatus = ref<'init' | 'fetching' | 'stale'>('init')
  const router = useRouter()

  const userPath = computed(() => {
    if (user.value === null) return ''
    return `Users/${user.value.uid}/Boards`
  })

  const dbRef = getDbRef(getDatabase(app), userPath.value)

  function update(snalshot: DataSnapshot) {
    if (dbStatus.value === 'init') {
      dbStatus.value = 'fetching'
    }

    snalshot.forEach((child) => {
      const boardIndex = boards.value.findIndex(
        (board) => board.key === child.key
      )

      if (boardIndex === -1) {
        boards.value = [
          ...boards.value,
          {
            key: child.key as string,
            data: child.val().data,
            meta: child.val().meta
          }
        ]
      } else {
        boards.value.splice(boardIndex, 1, {
          key: child.key as string,
          data: child.val().data,
          meta: child.val().meta
        })
      }
    })

    boards.value.sort((a, b) => {
      return b.meta.stamp - a.meta.stamp
    })

    if (dbStatus.value === 'fetching') {
      dbStatus.value = 'stale'
    }
  }

  const off = onValue(dbRef, update)

  watchEffect(() => {
    if (user.value === null) {
      boards.value = []
      off()
    }
  })

  async function updateBoard(id: string, data: Omit<Board, 'key'>) {
    const boardRef = getDbRef(
      getDatabase(app),
      `Users/${user.value?.uid}/Boards/${id}`
    )

    await updateDoc(boardRef, data)
  }

  async function deleteBoard(id: string) {
    const boardRef = getDbRef(
      getDatabase(app),
      `Users/${user.value?.uid}/Boards/${id}`
    )

    await remove(boardRef)

    await router.push('/user')
  }

  function useBoard(id: string) {
    const boardContext = useBoardContext()

    watchEffect(
      () => {
        const dbFound = boards.value.find((board) => board.key === id)

        if (
          boardContext.newBoard !== undefined &&
          dbStatus.value === 'stale' &&
          dbFound === undefined &&
          boardContext.newBoard !== id
        ) {
          void router.push('/404')
        }
      },
      { flush: 'post' }
    )

    return computed(
      () =>
        boards.value.find((board) => board.key === id) ??
        (BOARD_DEFAULT as Board)
    )
  }

  return {
    boards,
    useBoard,
    updateBoard,
    dbStatus,
    deleteBoard
  }
}

export const useBoards = createSharedComposable(useBoardsBase)
