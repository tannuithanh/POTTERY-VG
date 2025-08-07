<template>
    <div>
        <h2 style="font-size: 24px; margin-bottom: 20px; color: #c06252;">
                {{ categoryName }}
        </h2>

        <a-row :gutter="[16, 16]">
            <a-col v-for="news in paginatedNews" :key="news.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card hoverable style="border-radius: 12px; border: 1px solid #c06252; transition: 0.3s;"
                    :bodyStyle="{ padding: '16px' }" @mouseenter="hovered = news.id" @mouseleave="hovered = null">
                    <div style="margin-bottom: 8px;">
                        <strong style="font-size: 16px; color: #333;"
                            :style="hovered === news.id ? 'color: #c06252' : ''">
                            {{ news.title }}
                        </strong>
                    </div>

                    <div style="font-size: 13px; color: #666;">
                        📅 {{ formatDate(news.published_at) }}
                    </div>
                    <div style="font-size: 13px; color: #666;">
                        👤 {{ news.creator?.name || 'Không rõ' }}
                    </div>

                    <a @click="openDetail(news)"
                        style="display: inline-block; margin-top: 12px; color: #c06252; font-weight: 500;">
                        → Xem chi tiết
                    </a>
                </a-card>
            </a-col>
        </a-row>

        <div style="text-align: center; margin-top: 30px;">
            <a-pagination v-model:current="currentPage" :total="filteredNews.length" :pageSize="pageSize"
                show-size-changer :pageSizeOptions="['4', '8', '12', '16']"
                :show-total="(total) => `Tổng cộng ${total} bảng tin`" :style="{ color: '#c06252' }" />
        </div>

        <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { newsService } from '@/services/news_service/newsService'
import NewsDetailModal from './components/NewsDetailModal.vue'

const route = useRoute()
const categoryId = route.params.id

const allNews = ref([])
const categoryName = ref('')
const selectedNews = ref(null)
const modalVisible = ref(false)
const hovered = ref(null)

const openDetail = (news) => {
    selectedNews.value = news
    modalVisible.value = true
}

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(8)

const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredNews.value.slice(start, start + pageSize.value)
})

// Nếu có thêm filter thì áp dụng tại đây
const filteredNews = computed(() => allNews.value)

const loadNewsByCategory = async () => {
    try {
        const res = await newsService.getByCategory(categoryId)
        allNews.value = res.data.data
        categoryName.value = res.data.data[0]?.category?.name || 'Không có dữ liệu'
    } catch (err) {
        console.error('Lỗi tải bảng tin theo hạng mục:', err)
    }
}

onMounted(() => {
    loadNewsByCategory()
})
</script>
