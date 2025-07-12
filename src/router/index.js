import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

import FormLayouts from '@/pages/forms/FormLayouts.vue'
import SettingLayouts from '@/pages/setting/SettingLayouts.vue'
import UserManager from '@/pages/setting/components/UserManager.vue'
import HomeLayouts from '@/pages/home/HomeLayouts.vue'
import ProfileLayouts from '@/pages/profile/ProfileLayouts.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: HomeLayouts,
        meta: { title: 'Trang chủ' }
      },
      {
        path: '/forms',
        name: 'formsLayout',
        component: FormLayouts,
        meta: { title: 'Mẫu đăng ký' }
      },
      {
        path: '/settings',
        component: SettingLayouts,
        meta: { title: 'Cài đặt hệ thống' },
        children: [
            {
              path: '/user_manager',
              name: 'userManager',
              component: UserManager,
              meta: { title: 'Quản lý người dùng' }
            },
        ]
      },
            {
        path: '/profile',
        name: 'profile',
        component: ProfileLayouts,
        meta: { title: 'Thông tin người dùng' }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
