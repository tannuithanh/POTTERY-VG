<template>
    <div>
        <h2 style="margin-bottom: 16px;">Danh sách bảng tin</h2>
        <a-table :columns="columns" :dataSource="newsList" rowKey="id" bordered />
    </div>

    <NewsDetailModal v-model:visible="modalVisible" :news="selectedNews" />
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { newsService } from '@/services/news_service/newsService'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import NewsDetailModal from './components/NewsDetailModal.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const newsList = ref([])
const modalVisible = ref(false)
const selectedNews = ref(null)

// 👉 Format ngày không có giờ
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

// 👉 Cột bảng tin
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
        key: 'title',
    },
    {
        title: 'Danh mục',
        dataIndex: ['category', 'name'],
        key: 'category',
    },
    {
        title: 'Người tạo',
        dataIndex: ['creator', 'name'],
        key: 'creator',
    },
    {
        title: 'Ngày xuất bản',
        dataIndex: 'published_at',
        key: 'published_at',
        customRender: ({ text }) => formatDate(text),
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

// 👉 Load danh sách
const loadNews = async () => {
    const res = await newsService.getAll()
    newsList.value = res.data.data
}

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

onMounted(() => {
    loadNews()
})
</script>
