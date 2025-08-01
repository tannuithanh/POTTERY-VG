<template>
    <div class="notification-page">
        <h2>📨 Danh sách thông báo</h2>

        <a-spin :spinning="loading">
            <a-list :data-source="notifications" :locale="{ emptyText: 'Không có thông báo nào' }"
                item-layout="horizontal" bordered class="notification-list">
                <template #renderItem="{ item }">
                    <a-list-item :class="{ unread: !item.is_read }" @click="handleClick(item)" style="cursor: pointer">
                        <a-list-item-meta :title="item.title" :description="formatTime(item.created_at)">
                            <template #avatar>
                                <a-avatar :src="getAvatar(item)" shape="circle" />
                            </template>
                        </a-list-item-meta>

                        <template #actions>
                            <a-tag v-if="!item.is_read" color="red">Chưa đọc</a-tag>
                            <a-tag v-else color="default">Đã đọc</a-tag>
                        </template>
                    </a-list-item>
                </template>
            </a-list>
        </a-spin>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notification } from 'ant-design-vue'
import notificationService from '@/services/notification_service/notificationService'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

const notifications = ref([])
const loading = ref(false)

const fetchNotifications = async () => {
    loading.value = true
    try {
        const res = await notificationService.getAll()
        notifications.value = res.data?.data || res.data || []
    } catch (err) {
        notification.error({
            message: 'Lỗi tải thông báo',
            description: 'Không thể tải danh sách thông báo.',
        })
    } finally {
        loading.value = false
    }
}

const handleClick = async (item) => {
    if (!item.is_read) {
        await notificationService.markAsRead(item.id)
        item.is_read = true
    }

    if (item.link) {
        window.location.href = item.link
    } else if (item.module === 'news') {
        // show news modal nếu cần
    } else if (item.module === 'forms') {
        // show form modal nếu cần
    }
}

const getAvatar = (item) => {
    if (item.avatar) return item.avatar
    if (item.data?.avatar) return item.data.avatar

    switch (item.module) {
        case 'forms':
            return 'https://cdn-icons-png.flaticon.com/512/32/32205.png'
        case 'news':
            return 'https://png.pngtree.com/png-vector/20190725/ourlarge/pngtree-vector-newspaper-icon-png-image_1577280.jpg'
        case 'user':
            return 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
        default:
            return 'https://cdn-icons-png.flaticon.com/512/747/747376.png'
    }
}

const formatTime = (datetime) => {
    return dayjs(datetime).format('HH:mm DD/MM/YYYY')
}

onMounted(() => {
    fetchNotifications()
})
</script>

<style scoped>
.notification-page {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
}

h2 {
    margin-bottom: 20px;
    color: #c06252;
}

.notification-list :deep(.ant-list-item-meta-title) {
    font-weight: 600;
    font-size: 15px;
    color: #333;
}

.notification-list :deep(.ant-list-item-meta-description) {
    font-size: 12px;
    color: #888;
}

.notification-list .unread {
    background-color: #fff5f1;
    border-left: 4px solid #c06252;
}

.notification-list .unread:hover {
    background-color: #ffebe6;
}
</style>
