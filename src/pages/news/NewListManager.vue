<template>
     <div class="card-header">
    <div class="section-title">Danh sách bảng tin</div>
  </div>
    <a-card>
        <a-form layout="vertical">
            <a-row :gutter="12">
                <a-col :xs="24" :sm="12" :md="6">
                    <a-form-item>
                        <a-input v-model:value="searchKeyword" placeholder="Nhập tiêu đề hoặc nội dung..."
                            allow-clear />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :sm="12" :md="6">
                    <a-form-item>
                        <a-range-picker v-model:value="searchDateRange" format="DD/MM/YYYY" allow-clear
                            style="width: 100%" placeholder="Chọn khoảng ngày tạo" />
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>

        <div>
            <a-table :columns="columns" :dataSource="filteredNews" rowKey="id" bordered
                :scroll="{ x: 'max-content' }" />
        </div>
    </a-card>

    <NewsDetailModal v-model:visible="modalVisible" :news="selectedNews" />
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { newsService } from '@/services/news_service/newsService'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import NewsDetailModal from './components/NewsDetailModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const newsList = ref([])
const searchKeyword = ref('')
const searchDateRange = ref([])
const modalVisible = ref(false)
const selectedNews = ref(null)

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

const columns = [
    {
        title: 'STT',
        key: 'index',
        customRender: ({ index }) => index + 1,
        width: 60,
        align: 'center'
    },
    {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title'
    },
    {
        title: 'Danh mục',
        dataIndex: ['category', 'name'],
        key: 'category'
    },
    {
        title: 'Người tạo',
        dataIndex: ['creator', 'name'],
        key: 'creator'
    },
    {
        title: 'Ngày xuất bản',
        dataIndex: 'published_at',
        key: 'published_at',
        customRender: ({ text }) => formatDate(text)
    },
    {
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        width: 120,
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: true,
                showEdit: true,
                showDelete: true,
                onView: () => handleView(record),
                onEdit: () => handleEdit(record),
                onDelete: () => handleDelete(record)
            })
    }
]

// 👉 Lọc dữ liệu
const filteredNews = computed(() => {
    return newsList.value.filter((item) => {
        const keyword = searchKeyword.value.toLowerCase()
        const matchKeyword =
            !keyword ||
            item.title?.toLowerCase().includes(keyword) ||
            item.content?.toLowerCase()?.includes(keyword)

        const matchDate =
            !searchDateRange.value?.length ||
            (new Date(item.published_at) >= new Date(searchDateRange.value[0]) &&
                new Date(item.published_at) <= new Date(searchDateRange.value[1]))

        return matchKeyword && matchDate
    })
})

// 👉 Xem chi tiết
const handleView = (record) => {
    selectedNews.value = record
    modalVisible.value = true
}

// 👉 Sửa (mở modal hoặc route sau này)
const handleEdit = (record) => {
    router.push({ name: 'NewsEdit', params: { id: record.id } })
}

// 👉 Xoá
const handleDelete = (record) => {
    Modal.confirm({
        title: 'Xác nhận xoá',
        content: `Bạn có chắc chắn muốn xoá bảng tin "${record.title}" không?`,
        okText: 'Xoá',
        cancelText: 'Huỷ',
        okType: 'danger',
        onOk: async () => {
            try {
                await newsService.delete(record.id)
                message.success('Đã xoá bảng tin thành công')
                loadNews()
            } catch (err) {
                console.error(err)
                message.error('Xoá thất bại. Vui lòng thử lại.')
            }
        }
    })
}

// 👉 Load dữ liệu
const loadNews = async () => {
    const res = await newsService.getAll()
    newsList.value = res.data.data
}

onMounted(() => {
    loadNews()
})
</script>
