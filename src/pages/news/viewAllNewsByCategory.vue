<template>
    <div>
        <h2 style="font-size: 24px; margin-bottom: 20px; color: #c06252;">
            {{ categoryName }}
        </h2>

        <!-- 🔎 SEARCH TRONG HẠNG MỤC -->
        <a-input-search v-model:value="query" allowClear enter-button
            placeholder="Tìm trong hạng mục này (tiêu đề, nội dung, người tạo)…" @search="onSearchNow"
            style="max-width: 520px; margin-bottom: 16px" />

        <a-row :gutter="[16, 16]">
            <!-- Khi không có kết quả sau khi lọc, hiện Empty -->
            <template v-if="paginatedNews.length">
                <a-col v-for="news in paginatedNews" :key="news.id" :xs="24" :sm="12" :md="8" :lg="6">
                    <a-card hoverable style="border-radius: 12px; border: 1px solid #c06252; transition: 0.3s;"
                        :bodyStyle="{ padding: '16px' }" @mouseenter="hovered = news.id" @mouseleave="hovered = null">
                        <div style="margin-bottom: 8px;">
                            <strong style="font-size: 16px; color: #333;"
                                :style="hovered === news.id ? 'color: #c06252' : ''">
                                <!-- highlight tiêu đề theo query -->
                                <span v-html="highlight(news.title, query)"></span>
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
            </template>
            <template v-else>
                <a-col :span="24">
                    <a-empty description="Không tìm thấy bảng tin phù hợp trong hạng mục này" />
                </a-col>
            </template>
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
import { ref, onMounted, computed, watch } from 'vue'
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

// 🔎 SEARCH TRONG HẠNG MỤC
const query = ref('')                 // nội dung người dùng gõ
const onSearchNow = () => { /* giữ để Enter hoạt động; lọc đã làm ở computed */ }

// Mở chi tiết
const openDetail = (news) => {
    selectedNews.value = news
    modalVisible.value = true
}

// Format ngày dd/mm/yyyy (có padding)
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

// Bỏ dấu + lowercase để tìm không phân biệt dấu
const viNormalize = (s) =>
    (s ?? '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()

// Highlight phần khớp query (render bằng v-html ở template)
const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const highlight = (text, q) => {
    if (!q) return text ?? ''
    const t = text ?? ''
    const normText = viNormalize(t)
    const pattern = new RegExp(escapeReg(viNormalize(q)), 'gi')
    let out = '', i = 0, m
    while ((m = pattern.exec(normText)) !== null) {
        const start = m.index
        const end = start + m[0].length
        out += t.slice(i, start) + `<mark>${t.slice(start, end)}</mark>`
        i = end
    }
    out += t.slice(i)
    return out || t
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(8)

// ⚙️ FILTER TRONG HẠNG MỤC (client-side)
// - Lọc theo tiêu đề, nội dung/description, tên người tạo (không phân biệt dấu)
// - Sắp xếp mới nhất trước (optional: giữ nguyên nếu bạn muốn)
const filteredNews = computed(() => {
    const q = query.value.trim()
    if (!q) {
        // sort giảm dần theo ngày cho ổn định (có thể bỏ nếu không muốn)
        return [...allNews.value].sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    }
    const nq = viNormalize(q)
    const out = (allNews.value || []).filter((n) => {
        const title = viNormalize(n?.title)
        const content = viNormalize(n?.content || n?.description || '')
        const creator = viNormalize(n?.creator?.name || '')
        return title.includes(nq) || content.includes(nq) || creator.includes(nq)
    })
    out.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    return out
})

// Reset về trang 1 mỗi khi query đổi hoặc pageSize đổi
watch([query, pageSize], () => { currentPage.value = 1 })

const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredNews.value.slice(start, start + pageSize.value)
})

// Load dữ liệu theo hạng mục
const loadNewsByCategory = async () => {
    try {
        const res = await newsService.getByCategory(categoryId)
        allNews.value = Array.isArray(res?.data?.data) ? res.data.data : []
        categoryName.value = res?.data?.data?.[0]?.category?.name || 'Không có dữ liệu'
    } catch (err) {
        console.error('Lỗi tải bảng tin theo hạng mục:', err)
        allNews.value = []
        categoryName.value = 'Không có dữ liệu'
    }
}

onMounted(() => {
    loadNewsByCategory()
})
</script>

<style scoped>
/* giữ style cũ, thêm màu highlight cho mark */
mark {
    background: #fff1b8;
    padding: 0 2px;
    border-radius: 3px;
}
</style>
