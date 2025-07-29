import CreateNews from '@/pages/news/CreateNews.vue'
import NewsList from '@/pages/news/NewsList.vue'
import NewListManager from '@/pages/news/NewListManager.vue'

export default [
  {
    path: '/create_news',
    name: 'createNews',
    component: CreateNews,
    meta: { title: 'Tạo bảng tin' },
  },
  {
    path: '/news_list',
    name: 'newsList',
    component: NewsList,
    meta: { title: 'Bảng tin' },
  },
  {
    path: '/news_list_manager',
    name: 'newListManager',
    component: NewListManager,
    meta: { title: 'Quản lý bảng tin' },
  },
];
