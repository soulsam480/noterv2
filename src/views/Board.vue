<script setup lang="ts">
import { useUser } from '@/db'
import { useBoards } from '@/db/boards'
import { useBoardContext } from '@/layouts/WithNav.vue'
import Checklist from '@editorjs/checklist'
import CodeTool from '@editorjs/code'
import EditorJS from '@editorjs/editorjs'
import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import InlineCode from '@editorjs/inline-code'
import Link from '@editorjs/link'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import Quote from '@editorjs/quote'
import SimpleImage from '@editorjs/simple-image'
import Table from '@editorjs/table'
import { useDebounceFn } from '@vueuse/core'
import { useHead } from '@vueuse/head'
import { AMenu } from 'anu-vue'
import 'emoji-picker-element'
import type { Picker } from 'emoji-picker-element'
import type { EmojiPickerEventMap } from 'emoji-picker-element/shared'
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  boardId: string
}>()

const { useBoard, dbStatus, updateBoard } = useBoards()
const boardContext = useBoardContext()
const { user } = useUser()

const boardData = useBoard(props.boardId)
const editor = ref<EditorJS | null>(null)
const cover = ref('')
const editorInitialized = ref(false)

const emojiRef = ref<Picker | null>(null)
function titleRef() {
  return document.getElementById('board-head')
}

const dbReady = computed(() => !['init', 'fetching'].includes(dbStatus.value))

useHead({
  title: () =>
    `${boardData.value.meta.cover} ${boardData.value.meta.name} | ${user.value?.displayName}'s Noter`
})

watchEffect(
  () => {
    if (dbStatus.value === 'stale' && !editorInitialized.value) {
      const titleEl = titleRef()

      if (titleEl !== null) {
        titleEl.innerHTML = boardData.value.meta.name
      }

      cover.value = boardData.value.meta.cover

      editor.value = new EditorJS({
        autofocus: true,
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            inlineToolbar: ['link'],
            config: {
              placeholder: 'Header'
            },
            shortcut: 'CMD+SHIFT+H'
          },
          list: {
            class: List,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L',
            config: {
              placeholder: 'Add a list!'
            }
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
            config: {
              placeholder: 'Add a checklist !'
            }
          },
          code: {
            class: CodeTool,
            shortcut: 'CMD+SHIFT+C',
            config: {
              placeholder: 'Add a code block!'
            }
          },
          linkTool: {
            class: Link,
            config: {
              endpoint: import.meta.env.VITE_APP_API
            }
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M'
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          embed: Embed,
          quote: Quote,
          Marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
          },
          image: SimpleImage
        },
        data: boardData.value?.data,
        //@ts-expect-error bad types
        logLevel: 'ERROR',
        onChange
      })

      editorInitialized.value = true
    }
  },
  { flush: 'post' }
)

const _onChange = useDebounceFn(() => {
  if (boardContext.status === 'saving') return

  if (boardContext.newBoard !== undefined) {
    boardContext.newBoard = undefined
  }

  boardContext.setBoardStatus('saving')

  const title = titleRef()?.textContent ?? ''

  editor.value?.save().then((data) => {
    updateBoard(props.boardId, {
      data: data as any,
      meta: {
        name: title,
        cover: cover.value,
        coverBg: boardData.value.meta.coverBg,
        stamp: Date.now()
      }
    })
      .then(() => {
        boardContext.setBoardStatus('saved')
      })
      .catch((e) => console.log(e))
  })
}, 100)

function onChange() {
  _onChange()
}

function onCoverChange({ detail }: EmojiPickerEventMap['emoji-click']) {
  cover.value = (detail.unicode ?? (detail.emoji as any).unicode) as any
  onChange()
}

onMounted(() => {
  emojiRef.value?.addEventListener('emoji-click', onCoverChange)
})

onBeforeUnmount(() => {
  emojiRef.value?.removeEventListener('emoji-click', onCoverChange)
})
</script>

<template>
  <div class="px-3 py-2">
    <div id="editor">
      <!-- <button class="n-btn board-cover-change" @click="getgrad">
        Change Cover
      </button> -->

      <div class="flex items-center gap-2 max-w-[650px] mx-auto py-5">
        <button
          class="text-4xl flex-none"
          :disabled="!dbReady"
          :class="{
            'cursor-not-allowed': !dbReady
          }"
        >
          <a-menu>
            <emoji-picker ref="emojiRef"></emoji-picker>
          </a-menu>

          {{ cover }}
        </button>

        <h2
          id="board-head"
          :class="{
            'select-none cursor-not-allowed': !dbReady
          }"
          :aria-disabled="!dbReady"
          class="board__head text-4xl flex-grow outline-none font-semibold selection:text-zinc-900 text-zinc-50"
          contenteditable="true"
          :data-text="!dbReady ? 'Loading...' : 'Untitled'"
          @paste="onChange"
          @input="onChange"
        ></h2>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.board {
  &__head {
    &:empty:not(:focus):before {
      position: absolute;
      content: attr(data-text);
      color: var(--n-text-secondary);
    }
  }
}
</style>
