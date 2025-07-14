import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

import FormLayouts from '@/pages/forms/FormLayouts.vue'
import SettingLayouts from '@/pages/setting/SettingLayouts.vue'
import HomeLayouts from '@/pages/home/HomeLayouts.vue'
import ProfileLayouts from '@/pages/profile/ProfileLayouts.vue'
//Quản lý nhân sự
import UserManager from '@/pages/setting/components/user_manager/index.vue'
//Quản lý phòng ban
import DepartmentManager from '@/pages/setting/components/department_manager/index.vue'
//Quản lý bảng tin
import News from '@/pages/setting/components/news_manager/index.vue'
import NewsLayout from '@/pages/news/NewsLayout.vue'
import CreateNews from '@/pages/news/components/CreateNews.vue'
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
              path: 'user_manager',
              name: 'userManager',
              component: UserManager,
              meta: { title: 'Quản lý người dùng' }
            },
            {
              path: 'department_manager',
              name: 'departmentManager',
              component: DepartmentManager,
              meta: { title: 'Quản lý phòng ban' }
            },
            {
              path: 'news_manager',
              name: 'newsManager',
              component: News,
              meta: { title: 'Quản lý bảng tin' }
            },
        ]
      },
      {
        path: '/profile',
        name: 'profile',
        component: ProfileLayouts,
        meta: { title: 'Thông tin người dùng' }
      },
      {
        path: '/news',
        name: 'news',
        component: NewsLayout,
        meta: { title: 'Bảng tin' },
        children: [
            {
              path: 'create_news',
              name: 'createNews',
              component: CreateNews,
              meta: { title: 'Tạo bảng tin' }
            },
        ]
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {

  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
