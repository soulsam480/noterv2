import { createRouter, createWebHistory } from 'vue-router'
import IndexVue from '@/views/Index.vue'
import { authReady } from '@/db'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexVue,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/user',
      component: () => import('@/layouts/WithNav.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'user',
          component: () => import('@/views/User.vue'),
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/:boardId',
      component: () => import('@/layouts/WithNav.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'board',
          component: () => import('@/views/Board.vue'),
          meta: {
            requiresAuth: true
          },
          props: true
        }
      ]
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404.vue'),
      meta: {
        requiresAuth: false
      }
    }
  ]
})

router.beforeEach(async (to, _, next) => {
  const authState = await authReady()

  const requiresAuth = to.matched.every((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    if (authState !== null && to.name === 'home')
      return next({ path: (to.query.redirect as string) ?? '/user' })

    next()
  }

  if (authState !== null) return next()

  next({
    path: '/',
    query: {
      redirect: to.fullPath
    }
  })
})

export default router
