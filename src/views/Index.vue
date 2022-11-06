<script setup lang="ts">
import { app } from '@/db'
import { ATypography, ABtn } from 'anu-vue'
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { useRouter } from 'vue-router'

type AuthProviders = 'google' | 'github'

const providers = ['google', 'github']

const router = useRouter()

async function signIn(via: AuthProviders) {
  function getProvider(via: AuthProviders) {
    switch (via) {
      case 'google':
        return new GoogleAuthProvider()

      case 'github':
        return new GithubAuthProvider()
    }
  }

  try {
    await signInWithPopup(getAuth(app), getProvider(via))

    await router.push(
      (router.currentRoute.value.query.redirect as string) ?? '/user'
    )
  } catch (error) {
    console.log(error)
  }
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <nav
      class="flex gap-2 items-center p-2 bg-zinc-900 border-b border-zinc-700 text-white"
    >
      <div>Noter</div>
    </nav>

    <div
      class="grid sm:grid-cols-2 items-center grid-cols-1 gap-2 mt-20 sm:w-2/3 mx-auto"
    >
      <div>
        <a-typography
          :title="['Noter', 'text-5xl']"
          :subtitle="[
            'Create notes/boards in multiple blocks in realtime sync with all your devices.',
            'text-lg'
          ]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <a-typography title="Get started" />

        <div class="flex items-center gap-2">
          <a-btn
            v-for="provider in providers"
            :key="provider"
            @click="signIn(provider as any)"
            variant="light"
            :icon="`i-ph-${provider}-logo-bold`"
            >{{ provider }}</a-btn
          >
        </div>
      </div>
    </div>
  </div>
</template>
