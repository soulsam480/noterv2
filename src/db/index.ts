import { initializeApp } from 'firebase/app'
import { useAuth } from '@vueuse/firebase'
import { getAuth, type User } from 'firebase/auth'
import { useRouter } from 'vue-router'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DB_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGEING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

const authState = getAuth(app)

export async function authReady() {
  return new Promise<User | null>((resolve) => {
    authState.onAuthStateChanged((user) => {
      resolve(user)
    })
  })
}

export function useUser() {
  const router = useRouter()

  return {
    ...useAuth(getAuth(app)),
    async signOut() {
      await authState.signOut()
      await router.push('/')
    }
  }
}
