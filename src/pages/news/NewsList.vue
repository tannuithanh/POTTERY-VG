<template>
    <div class="fx-root" :class="{ 'fx-ready': effectsReady }">
        <!-- Ô tìm kiếm -->
        <a-input-search v-model:value="query" :loading="searching" allowClear enter-button
            placeholder="Tìm tin theo tiêu đề, nội dung hoặc danh mục…" @search="onSearchNow"
            style="margin-bottom: 16px" class="fx fx-up delay-1" />

        <!-- ========== CHẾ ĐỘ TÌM KIẾM ========== -->
        <div v-if="isSearching" class="search-wrap">
            <!-- Skeleton khi đang searching -->
            <div v-if="searching" class="sk-list">
                <div v-for="n in 6" :key="'sk-' + n" class="sk-item"></div>
            </div>

            <!-- Kết quả -->
            <template v-else>
                <transition-group name="list" tag="div">
                    <div v-for="(item, i) in searchResults" :key="`sr-${item.id}`" class="search-item fx fx-zoom-in"
                        :style="staggerStyle(i, 50)">
                        <div class="search-title" v-html="highlight(item.title, query)"></div>
                        <div class="search-meta">{{ formatDate(item.published_at) }}</div>
                        <a-tag :bordered="false">{{ item.category?.name ?? 'Khác' }}</a-tag>
                        <div class="search-action">
                            <a @click.prevent="openDetail(item)">→ Xem chi tiết</a>
                        </div>
                    </div>
                </transition-group>

                <!-- Không có kết quả -->
                <a-empty v-if="!searchResults.length" description="Không tìm thấy kết quả phù hợp"
                    class="fx fx-fade delay-2" />
            </template>
        </div>

        <!-- ========== CHẾ ĐỘ NHÓM THEO DANH MỤC ========== -->
        <a-row v-else :gutter="[16, 16]">
            <a-col v-for="(group, gi) in groupedNews" :key="group.category.id" :xs="24" :sm="12" :md="8" :lg="6">
                <div class="fx fx-rise" :style="staggerStyle(gi, 80)">
                    <a-card :bodyStyle="{ backgroundColor: '#c06252' }" bordered>
                        <template #title>
                            <div class="cat-title">
                                <span class="cat-name">{{ group.category.name }}</span>
                            </div>
                        </template>

                        <!-- Có tin -->
                        <div v-if="Array.isArray(group.news) && group.news.length">
                            <transition-group name="fade-up" tag="div">
                                <div v-for="(item, ii) in group.news" :key="`${group.category.id}-${item.id}`"
                                    class="news-item fx fx-up" :style="staggerStyle(ii, 50)">
                                    <div><strong class="news-title">{{ item.title }}</strong></div>
                                    <div class="news-date">{{ formatDate(item.published_at) }}</div>
                                    <a @click.prevent="openDetail(item)">→ Xem chi tiết</a>
                                </div>
                            </transition-group>
                        </div>

                        <!-- Không có tin -->
                        <a-empty style="color: white;" v-else :image="simpleImage" />

                        <!-- Nút xem tất cả -->
                        <div class="see-all">
                            <a @click="viewAll(group.category.id)" class="see-all-a">
                                <UnorderedListOutlined style="margin-right: 4px" />
                                Xem tất cả
                            </a>
                        </div>
                    </a-card>
                </div>
            </a-col>
        </a-row>

        <!-- Modal chi tiết tin -->
        <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, nextTick } from "vue"
import { useRouter } from "vue-router"
import { Empty } from "ant-design-vue"
import { UnorderedListOutlined } from "@ant-design/icons-vue"
import { newsService } from "@/services/news_service/newsService"
import NewsDetailModal from "./components/NewsDetailModal.vue"

const router = useRouter()

/* =======================
   STATE
======================= */
const groupedNews = ref([])
const selectedNews = ref(null)
const modalVisible = ref(false)
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

// Search
const USE_SERVER_SEARCH = false
const query = ref("")
const searching = ref(false)
const searchResults = ref([])
const isSearching = computed(() => query.value.trim().length > 0)

// Effects gate
const effectsReady = ref(false)

/* =======================
   LOAD
======================= */
const loadGroupedNews = async () => {
    try {
        const res = await newsService.groupByCategory()
        groupedNews.value = Array.isArray(res?.data?.data) ? res.data.data : []
    } catch (error) {
        console.error("Lỗi khi tải bảng tin:", error)
        groupedNews.value = []
    } finally {
        // Bật hiệu ứng sau khi có dữ liệu (hoặc timeout fallback)
        await nextTick()
        effectsReady.value = true
    }
}

/* =======================
   UI HANDLERS
======================= */
const openDetail = (news) => {
    selectedNews.value = news
    modalVisible.value = true
}
const viewAll = (categoryId) => {
    router.push({ name: 'viewAllCateGory', params: { id: categoryId } })
}

/* =======================
   HELPERS
======================= */
const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}
const viNormalize = (s) =>
    (s ?? "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
let debounceTimer = null
const debounce = (fn, ms = 300) => (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fn(...args), ms)
}
const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const highlight = (text, q) => {
    if (!q) return text ?? ""
    const t = text ?? ""
    const nq = viNormalize(q)
    // Dùng index theo chuỗi đã normalize để tìm vị trí, sau đó cắt theo t (gốc)
    const idx = viNormalize(t)
    const pattern = new RegExp(escapeReg(nq), "gi")
    let out = "", i = 0, m
    while ((m = pattern.exec(idx)) !== null) {
        const start = m.index
        const end = start + m[0].length
        out += t.slice(i, start) + `<mark class="mk-pulse">${t.slice(start, end)}</mark>`
        i = end
    }
    out += t.slice(i)
    return out || t
}

/* =======================
   SEARCH
======================= */
const flattenNews = () => {
    const flat = []
    for (const g of groupedNews.value) {
        const cat = g?.category
        const items = Array.isArray(g?.news) ? g.news : []
        for (const it of items) flat.push({ ...it, category: cat })
    }
    return flat
}
const clientSearch = (q) => {
    const nq = viNormalize(q)
    const flat = flattenNews()
    const filtered = flat.filter((it) => {
        const title = viNormalize(it?.title)
        const content = viNormalize(it?.content || it?.description || "")
        const cat = viNormalize(it?.category?.name || "")
        return title.includes(nq) || content.includes(nq) || cat.includes(nq)
    })
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    return filtered
}
const serverSearch = async (q) => {
    const res = await newsService.search({ q })
    return Array.isArray(res?.data?.data) ? res.data.data : []
}
const doSearch = async () => {
    const q = query.value.trim()
    if (!q) {
        searchResults.value = []
        return
    }
    searching.value = true
    try {
        searchResults.value = USE_SERVER_SEARCH ? await serverSearch(q) : clientSearch(q)
    } catch (e) {
        console.error("Search error:", e)
        searchResults.value = []
    } finally {
        searching.value = false
    }
}
const onSearchDebounced = debounce(doSearch, 300)
const onSearchNow = () => doSearch()

watchEffect(() => {
    const q = query.value.trim()
    if (q) onSearchDebounced()
    else searchResults.value = []
})

/* =======================
   LIFE CYCLE
======================= */
onMounted(() => {
    loadGroupedNews()
})

/* =======================
   FX helpers
======================= */
const staggerStyle = (i, step = 60) => ({ '--delay': `${i * step}ms` })
</script>

<style scoped>
/* ======= FX system ======= */
.fx-root {
    position: relative;
}

.fx {
    opacity: 0;
    transform: translateY(6px);
    will-change: transform, opacity;
}

.fx-ready .fx {
    animation-fill-mode: both;
    animation-duration: .7s;
    animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

.fx-up {
    animation-name: fx-up;
}

.fx-rise {
    animation-name: fx-rise;
}

.fx-fade {
    animation-name: fx-fade;
    transform: none;
}

.fx-zoom-in {
    animation-name: fx-zoom-in;
    transform: scale(.96);
}

.delay-1 {
    animation-delay: 60ms;
}

.delay-2 {
    animation-delay: 160ms;
}

.fx-ready .fx-zoom-in {
    animation-delay: var(--delay, 0ms);
}

.fx-ready .fx-up {
    animation-delay: var(--delay, 0ms);
}

.fx-ready .fx-rise {
    animation-delay: var(--delay, 0ms);
}

@keyframes fx-up {
    0% {
        opacity: 0;
        transform: translateY(12px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fx-rise {
    0% {
        opacity: 0;
        transform: translateY(16px) scale(.98);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fx-fade {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes fx-zoom-in {
    0% {
        opacity: 0;
        transform: scale(.94);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* ======= TransitionGroup ======= */
.list-enter-active,
.list-leave-active {
    transition: all .35s cubic-bezier(.2, .8, .2, 1);
}

.list-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.list-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

.fade-up-enter-active,
.fade-up-leave-active {
    transition: all .35s cubic-bezier(.2, .8, .2, 1);
}

.fade-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-up-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ======= Search skeleton ======= */
.sk-list {
    display: grid;
    gap: 10px;
}

.sk-item {
    height: 86px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f3f4f6 0%, #edeff2 40%, #f3f4f6 80%);
    background-size: 200% 100%;
    animation: sk-move 1.2s ease-in-out infinite;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
}

@keyframes sk-move {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ======= Cards & layout ======= */
.cat-title .cat-name {
    font-size: 20px;
    color: white;
    font-weight: 700;
}

.see-all {
    text-align: right;
    margin-top: 10px;
}

.see-all-a {
    color: white;
    font-size: 13px;
}

/* ======= Items ======= */
.news-item {
    background: white;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 8px;
}

.news-title {
    font-size: 16px;
    font-weight: 600;
}

.news-date {
    font-size: 13px;
    color: gray;
    margin: 2px 0 6px;
}

.search-item {
    background: #fff;
    padding: 14px;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
    margin-bottom: 10px;
}

.search-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
}

.search-meta {
    font-size: 13px;
    color: gray;
    margin-bottom: 6px;
}

.search-action a {
    font-size: 14px;
}

/* Highlight mark + pulse */
mark {
    background: #fff1b8;
    padding: 0 2px;
    border-radius: 3px;
}

.mk-pulse {
    animation: mk-pulse .8s ease-out both;
}

@keyframes mk-pulse {
    0% {
        box-shadow: inset 0 0 0 0 rgba(255, 193, 7, .0);
    }

    30% {
        box-shadow: inset 0 0 0 100px rgba(255, 193, 7, .18);
    }

    100% {
        box-shadow: inset 0 0 0 0 rgba(255, 193, 7, .0);
    }
}

/* Tôn trọng người dùng không thích animation */
@media (prefers-reduced-motion: reduce) {

    .fx,
    .fx-ready .fx,
    .list-enter-active,
    .list-leave-active,
    .fade-up-enter-active,
    .fade-up-leave-active,
    .mk-pulse {
        animation: none !important;
        transition: none !important;
        opacity: 1 !important;
        transform: none !important;
    }
}
</style>
