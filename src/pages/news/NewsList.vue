<template>
    <div>
        <!-- =======================
            THANH TÌM KIẾM
            - v-model:value="query": bind dữ liệu search
            - :loading="searching": hiện icon loading khi đang tìm
            - allowClear: nút xóa
            - enter-button: có nút enter
            - @search="onSearchNow": gọi hàm tìm khi bấm enter/nút
        ======================== -->
        <a-input-search v-model:value="query" :loading="searching" allowClear enter-button
            placeholder="Tìm tin theo tiêu đề, nội dung hoặc danh mục…" @search="onSearchNow"
            style="margin-bottom: 16px" />

        <!-- =======================
            KẾT QUẢ TÌM KIẾM
            - Chỉ hiển thị khi isSearching = true (tức là đang có nội dung search)
        ======================== -->
        <div v-if="isSearching">
            <!-- Có kết quả -->
            <template v-if="searchResults.length">
                <a-list :data-source="searchResults" item-layout="vertical">
                    <!-- renderItem: cách hiển thị từng kết quả -->
                    <template #renderItem="{ item }">
                        <a-list-item :key="item.id">
                            <div class="search-item">
                                <!-- v-html để highlight -->
                                <div class="search-title" v-html="highlight(item.title, query)"></div>
                                <div class="search-meta">{{ formatDate(item.published_at) }}</div>
                                <a-tag>{{ item.category?.name ?? 'Khác' }}</a-tag>
                                <div class="search-action">
                                    <!-- @click.prevent: mở modal chi tiết -->
                                    <a @click.prevent="openDetail(item)">→ Xem chi tiết</a>
                                </div>
                            </div>
                        </a-list-item>
                    </template>
                </a-list>
            </template>
            <!-- Không có kết quả -->
            <a-empty description="Không tìm thấy kết quả phù hợp" />
        </div>

        <!-- =======================
            LƯỚI THEO DANH MỤC (MẶC ĐỊNH)
            - Hiển thị khi không search
        ======================== -->
        <a-row v-else :gutter="[16, 16]">
            <a-col v-for="group in groupedNews" :key="group.category.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card :bodyStyle="{ backgroundColor: '#c06252' }" bordered>
                    <template #title>
                        <div>
                            <span style="font-size: 20px; color: white">{{ group.category.name }}</span>
                        </div>
                    </template>

                    <!-- Có tin tức -->
                    <div v-if="Array.isArray(group.news) && group.news.length">
                        <div v-for="item in group.news" :key="`${group.category.id}-${item.id}`" class="news-item">
                            <div><strong class="news-title">{{ item.title }}</strong></div>
                            <div class="news-date">{{ formatDate(item.published_at) }}</div>
                            <a @click.prevent="openDetail(item)">→ Xem chi tiết</a>
                        </div>
                    </div>
                    <!-- Không có tin -->
                    <a-empty style="color: white;" v-else :image="simpleImage" />

                    <!-- Nút xem tất cả -->
                    <div style="text-align: right; margin-top: 10px;">
                        <a @click="viewAll(group.category.id)" style="color: white; font-size: 13px;">
                            <UnorderedListOutlined style="margin-right: 4px" />
                            Xem tất cả
                        </a>
                    </div>
                </a-card>
            </a-col>
        </a-row>

        <!-- Modal chi tiết tin -->
        <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
    </div>
</template>

<script setup>
/* =======================
    IMPORT CẦN DÙNG
======================= */
import { ref, onMounted, computed, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { Empty, List, Tag } from "ant-design-vue"
import { UnorderedListOutlined } from "@ant-design/icons-vue"
import { newsService } from "@/services/news_service/newsService"
import NewsDetailModal from "./components/NewsDetailModal.vue"

const router = useRouter()

/* =======================
    STATE CHÍNH
======================= */
// Dữ liệu nhóm tin theo danh mục
const groupedNews = ref([])
// Tin được chọn để xem chi tiết
const selectedNews = ref(null)
// Trạng thái modal
const modalVisible = ref(false)
// Ảnh empty mặc định của Antd
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

/* =======================
    STATE TÌM KIẾM
======================= */
const USE_SERVER_SEARCH = false // true nếu muốn tìm qua server
const query = ref("") // nội dung người dùng nhập
const searching = ref(false) // đang tìm
const searchResults = ref([]) // kết quả
const isSearching = computed(() => query.value.trim().length > 0) // đang ở chế độ tìm kiếm

/* =======================
    LOAD DỮ LIỆU BAN ĐẦU
======================= */
const loadGroupedNews = async () => {
    try {
        const res = await newsService.groupByCategory()
        groupedNews.value = Array.isArray(res?.data?.data) ? res.data.data : []
    } catch (error) {
        console.error("Lỗi khi tải bảng tin:", error)
        groupedNews.value = []
    }
}

/* =======================
    HÀM XỬ LÝ UI
======================= */
// Mở modal xem chi tiết
const openDetail = (news) => {
    selectedNews.value = news
    modalVisible.value = true
}
// Xem tất cả tin của danh mục
const viewAll = (categoryId) => {
    router.push({ name: 'viewAllCateGory', params: { id: categoryId } })
}
/* =======================
    HÀM HỖ TRỢ
======================= */
// Định dạng ngày dd/mm/yyyy
const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

// Bỏ dấu tiếng Việt
const viNormalize = (s) =>
    (s ?? "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()

// Debounce đơn giản (trì hoãn hàm)
let debounceTimer = null
const debounce = (fn, ms = 300) => (...args) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fn(...args), ms)
}

// Render 1 item kết quả tìm kiếm (dùng h)
const renderSearchItem = (item) =>
    h(List.Item, { key: item.id }, {
        default: () => [
            h("div", { class: "search-item" }, [
                h("div", { class: "search-title", innerHTML: highlight(item.title, query.value) }),
                h("div", { class: "search-meta" }, formatDate(item.published_at)),
                h(Tag, { bordered: false }, { default: () => item.category?.name ?? "Khác" }),
                h("div", { class: "search-action" }, [
                    h("a", { onClick: () => openDetail(item) }, "→ Xem chi tiết")
                ])
            ])
        ]
    })

// Highlight phần khớp query trong text
const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const highlight = (text, q) => {
    if (!q) return text ?? ""
    const t = text ?? ""
    const pattern = new RegExp(escapeReg(viNormalize(q)), "gi")
    const idx = viNormalize(t)
    let out = "", i = 0, m
    while ((m = pattern.exec(idx)) !== null) {
        const start = m.index
        const end = start + m[0].length
        out += t.slice(i, start) + `<mark>${t.slice(start, end)}</mark>`
        i = end
    }
    out += t.slice(i)
    return out || t
}

/* =======================
    HÀM TÌM KIẾM
======================= */
// Tìm client-side
const clientSearch = (q) => {
    const nq = viNormalize(q)
    const flat = []
    for (const g of groupedNews.value) {
        const cat = g?.category
        const items = Array.isArray(g?.news) ? g.news : []
        for (const it of items) flat.push({ ...it, category: cat })
    }
    const filtered = flat.filter((it) => {
        const title = viNormalize(it?.title)
        const content = viNormalize(it?.content || it?.description || "")
        const cat = viNormalize(it?.category?.name || "")
        return title.includes(nq) || content.includes(nq) || cat.includes(nq)
    })
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    return filtered
}

// Tìm server-side
const serverSearch = async (q) => {
    const res = await newsService.search({ q })
    return Array.isArray(res?.data?.data) ? res.data.data : []
}

// Gọi tìm kiếm
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

// Tìm có debounce
const onSearchDebounced = debounce(doSearch, 300)
// Tìm ngay khi bấm Enter
const onSearchNow = () => doSearch()

// Theo dõi query để tự tìm
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
</script>

<style scoped>
/* Style cho item tin */
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

/* Style cho item kết quả tìm kiếm */
.search-item {
    background: #fff;
    padding: 14px;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
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

/* Màu nền highlight */
mark {
    background: #fff1b8;
    padding: 0 2px;
    border-radius: 3px;
}
</style>

