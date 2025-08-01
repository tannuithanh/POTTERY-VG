<template>
    <a-dropdown placement="bottomRight" trigger="click">
        <template #default>
            <a-button shape="circle" type="text"
                style="width: 40px; height: 27px; font-size: 20px; display: flex; justify-content: center;">
                <a-badge :count="unreadCount" size="small" :color="mainColor">
                    <BellOutlined style="font-size: 20px; cursor: pointer" />
                </a-badge>
            </a-button>
        </template>

        <template #overlay>
            <div class="dropdown-box">
                <a-list :data-source="notifications.slice(0, 5)" :locale="{ emptyText: 'Không có thông báo' }"
                    item-layout="horizontal" class="notification-list">
                    <template #renderItem="{ item }">
                        <a-list-item class="notification-item" :class="{ 'unread': !item.is_read }"
                            @click="handleClick(item)">
                            <a-list-item-meta :title="item.title">
                                <template #avatar>
                                    <a-avatar :src="getAvatar(item)" shape="circle" class="avatar-center" />
                                </template>
                                <template #description>
                                    <div class="message">{{ item.message }}</div>
                                    <div class="time">{{ formatDateTime(item.created_at) }}</div>
                                </template>
                            </a-list-item-meta>
                        </a-list-item>
                    </template>
                </a-list>

                <!-- Nút xem tất cả -->
                <div class="see-all" @click="handleSeeAll">
                    Xem tất cả thông báo
                </div>
            </div>
        </template>
    </a-dropdown>
    <FormInstanceDetail v-if="selectedNotification" :visible="showGatePassModal" :form-instance="selectedNotification"
        @close="showGatePassModal = false" />
    <NewsDetailModal :visible="showNewsModal" :news="selectedNews" @update:visible="showNewsModal = $event" />

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BellOutlined } from '@ant-design/icons-vue'
import notificationService from '@/services/notification_service/notificationService'
import { formatDateTime } from '@/utils/formatDate'
import { notification } from 'ant-design-vue'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import FormInstanceDetail from '@/pages/forms/leaveForm/FormInstanceDetail.vue'
import { newsService } from '@/services/news_service/newsService'
import NewsDetailModal from '@/pages/news/components/NewsDetailModal.vue'
import { useAuthStore } from '@/stores/auth'
const mainColor = '#c06252'
const notifications = ref([])

const unreadCount = ref(0)

// 🔄 Load thông báo từ API khi mounted
const fetchNotifications = async () => {
    try {
        const res = await notificationService.getAll()
        notifications.value = res.data || []
        unreadCount.value = notifications.value.filter(n => !n.is_read).length
    } catch (error) {
        console.error('Lỗi khi load thông báo:', error)
    }
}

const getAvatar = (item) => {
    if (item.module === 'forms') {
        return 'https://cdn-icons-png.flaticon.com/512/32/32205.png' // Icon form
    }
    if (item.module === 'news') {
        return 'https://png.pngtree.com/png-vector/20190725/ourlarge/pngtree-vector-newspaper-icon-png-image_1577280.jpg' // Icon news
    }
    if (item.module === 'user') {
        return 'https://cdn-icons-png.flaticon.com/512/847/847969.png' // Icon user
    }

    // Ưu tiên avatar thật nếu có
    return item.avatar || 'https://cdn-icons-png.flaticon.com/512/747/747376.png' // Default icon
}

onMounted(() => {
    fetchNotifications()
    window.Echo.channel('notifications')
        .listen('RealtimeNotificationSent', (e) => {    
            notification.info({
                message: `Thông báo!`,
                description: 'Bạn có thông báo mới'
            })
            fetchNotifications()
        })

})

const selectedNotification = ref(null)
const showGatePassModal = ref(false)

const selectedNews = ref(null)
const showNewsModal = ref(false)

const handleClick = async (item) => {
    try {
        if (!item.is_read) {
            await notificationService.markAsRead(item.id)
            item.is_read = true
            unreadCount.value = notifications.value.filter(n => !n.is_read).length
        }

        if (item.module === 'forms' && item.data?.form_code === 'GateEntry') {
            const res = await formInstanceService.getById(item.reference_id)
            selectedNotification.value = res.data
            showGatePassModal.value = true

        } else if (item.module === 'news') {
            const res = await newsService.getById(item.reference_id)
            console.log(res.data)
            selectedNews.value = res.data.data
            showNewsModal.value = true

        } else {
            window.location.href = item.link || '/'
        }
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Không tải được nội dung. Vui lòng thử lại.'
        })
    }
}

const handleSeeAll = () => {
    window.location.href = '/notifications'
}
</script>


<style scoped>
.notification-item.unread {
    background-color: #fff7f0;
    /* Màu nền nhẹ cho chưa đọc */
    font-weight: 500;
}

.notification-item.unread:hover {
    background-color: #ffeede;
}

.message {
    font-size: 13px;
    color: #555;
    margin-bottom: 4px;
}

.time {
    font-size: 12px;
    color: #999;
}

.dropdown-box {
    width: 320px;
    max-height: 460px;
    background: white;
    border: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 10px;
}

.notification-list {
    max-height: 380px;
    overflow-y: auto;
}

.notification-item:hover {
    background-color: #fafafa;
    cursor: pointer;
}

:deep(.ant-list-item-meta-title) {
    font-weight: 600;
    color: #c06252;
    margin-bottom: 4px;
    font-size: 14px;
}

:deep(.ant-list-item-meta-description) {
    font-size: 12px;
    color: #999;
}

.see-all {
    text-align: center;
    padding: 10px;
    border-top: 1px solid #eee;
    font-weight: 500;
    color: #c06252;
    cursor: pointer;
}

.see-all:hover {
    background-color: #f5f5f5;
}
</style>