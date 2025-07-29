<template>
    <a-row :gutter="[16, 16]">
        <a-col v-for="group in groupedNews" :key="group.category.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card :bodyStyle="{ backgroundColor: '#c06252' }" bordered>
                <template #title>
                    <div>
                        <span style="font-size: 20px; color: white">{{ group.category.name }}</span>
                    </div>
                </template>

                <div v-if="group.news.length">
                    <div v-for="item in group.news" :key="item.id"
                        style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px">
                        <div><strong style="font-size: 16px;">{{ item.title }}</strong></div>
                        <div style="font-size: 14px; color: gray">{{ formatDate(item.published_at) }}</div>
                        <a @click="openDetail(item)">→ Xem chi tiết</a>
                    </div>
                </div>
                <div v-else style="color: white; margin-bottom: 8px;">Chưa có bảng tin nào.</div>

                <!-- ✅ Nút Xem tất cả dưới cùng, căn phải -->
                <div style="text-align: right; margin-top: 10px;">
                    <a @click="viewAll(group.category)" style="color: white; font-size: 13px;">
                        <UnorderedListOutlined style="margin-right: 4px" />
                        Xem tất cả
                    </a>
                </div>
            </a-card>

        </a-col>
    </a-row>

    <NewsDetailModal :news="selectedNews" v-model:visible="modalVisible" />
</template>

<script setup>
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import { ref, onMounted } from "vue";
import { newsService } from "@/services/news_service/newsService";
import NewsDetailModal from "./components/NewsDetailModal.vue";
const groupedNews = ref([]);

const loadGroupedNews = async () => {
    try {
        const res = await newsService.groupByCategory();
        groupedNews.value = res.data.data;
    } catch (error) {
        console.error("Lỗi khi tải bảng tin:", error);
    }
};


const selectedNews = ref(null)
const modalVisible = ref(false)

const openDetail = (news) => {
    selectedNews.value = news
    modalVisible.value = true
    console.log(selectedNews.value)
}
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}
onMounted(() => {
    loadGroupedNews();
});
</script>
