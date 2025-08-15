<template>
    <a-layout-header class="header">
        <div class="header-mobile">
            <img src="@/assets/images/logo.png" alt="Logo" class="header__logo" />
            <div style="display: flex; align-items: center; gap: 4px;">
                <!-- Chuông sát bên -->
                <div style="margin: 10px;">
                    <NotificationBell />
                </div>
                <!-- Menu icon -->
                <menu-outlined class="mobile-menu-icon" @click="drawerVisible = true" style="font-size: 22px;" />


            </div>


            <a-drawer theme="light" placement="left" width="280" :visible="drawerVisible"
                @close="drawerVisible = false">
                <div class="mobile-drawer">
                    <a-menu mode="inline" theme="light" :openKeys="openKeys" @openChange="onOpenChange"
                        @click="drawerVisible = false">
                        <a-menu-item key="home">
                            <router-link to="/">
                                <HomeOutlined />
                                <span>Trang chủ</span>
                            </router-link>
                        </a-menu-item>
                        <a-sub-menu :icon="h(IdcardOutlined)"
                            v-if="authStore.user?.is_admin || authStore.user?.modules?.some(m => m.code === 'form')"
                            key="profile" title="Hồ sơ điện tử">
                            <a-menu-item key="forms_create">
                                <router-link to="/forms_create">Tạo hồ sơ điện tử</router-link>
                            </a-menu-item>
                            <a-menu-item key="profile-list">
                                <router-link to="/check_form_create">Danh sách hồ sơ</router-link>
                            </a-menu-item>
                        </a-sub-menu>

                        <a-sub-menu  :icon="h(ProfileOutlined)"  key="news" title="Bảng tin">
                            <a-menu-item
                                v-if="authStore.user?.is_admin || authStore.user?.modules?.some(m => m.code === 'news')"
                                key="create_news">
                                <router-link to="/create_news">Tạo bảng tin</router-link>
                            </a-menu-item>
                            <a-menu-item key="news_list">
                                <router-link to="/news_list">Thông tin bảng tin</router-link>
                            </a-menu-item>
                            <a-menu-item
                                v-if="authStore.user?.is_admin || authStore.user?.modules?.some(m => m.code === 'news')"
                                key="News-list_manager">
                                <router-link to="/news_list_manager">Danh sách hồ sơ</router-link>
                            </a-menu-item>
                        </a-sub-menu>

                        <a-sub-menu key="meetings" :icon="h(CalendarOutlined)" title="Lịch họp">
                            <a-menu-item key="meeting-manager">
                                <router-link to="/meeting-manager">Quản lý lịch họp</router-link>
                            </a-menu-item>
                            <a-menu-item key="create_meeting">
                                <router-link to="/create-meeting">Đăng ký lịch họp</router-link>
                            </a-menu-item>
                            <a-menu-item key="meeting-calendar">
                                <router-link to="/meeting-calendar">Lịch</router-link>
                            </a-menu-item>
                        </a-sub-menu>
                    </a-menu>

                    <div class="mobile-user">
                        <a-avatar :size="80" :src="avatar" />
                        <div class="user-name">{{ authStore.user?.name }}</div>
                        <div class="user-email">{{ authStore.user?.position_detail }}</div>

                        <a-menu class="custom-dropdown-menu" mode="vertical">
                            <a-menu-item key="settings">
                                <template #icon>
                                    <SettingOutlined />
                                </template>
                                <router-link to="/settings">Cài đặt hệ thống</router-link>
                            </a-menu-item>

                            <a-menu-item v-if="authStore.user?.is_admin != 0" key="module-management">
                                <template #icon>
                                    <AppstoreOutlined />
                                </template>
                                <router-link to="/module-management">Quản lý chức năng</router-link>
                            </a-menu-item>

                            <a-menu-item key="profile">
                                <template #icon>
                                    <InfoCircleOutlined />
                                </template>
                                <router-link to="/profile">Thông tin người dùng</router-link>
                            </a-menu-item>

                            <a-menu-item key="change-password" @click="changePassVisible = true">
                                <template #icon>
                                    <KeyOutlined />
                                </template>
                                Đổi mật khẩu
                            </a-menu-item>

                            <a-menu-item key="logout" danger @click="logout">
                                <template #icon>
                                    <LogoutOutlined />
                                </template>
                                Đăng xuất
                            </a-menu-item>
                        </a-menu>
                    </div>

                </div>
            </a-drawer>
        </div>
        <ChangePasswordModal v-model:visible="changePassVisible" />
    </a-layout-header>
</template>


<script setup>
import {
    HomeOutlined,
    MenuOutlined,
    SettingOutlined,
    LogoutOutlined,
    KeyOutlined,
    InfoCircleOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    IdcardOutlined,
    ProfileOutlined
} from '@ant-design/icons-vue'
import { ref,h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { onMounted, computed } from 'vue'
import { resolveStoragePath } from '@/utils/storage'
import ChangePasswordModal from '@/components/common/ChangePasswordModal.vue'
import NotificationBell from '../common/NotificationBell.vue'

const changePassVisible = ref(false)
const drawerVisible = ref(false)
const openKeys = ref([])

function onOpenChange(keys) {
    openKeys.value = keys
}



const authStore = useAuthStore()
const router = useRouter()
const avatar = computed(() =>
    authStore.user?.avatar ? resolveStoragePath(authStore.user.avatar) : ''
)

const logout = async () => {
    try {
        await authStore.logout()
        notification.success({
            message: 'Đăng xuất',
            description: 'Bạn đã đăng xuất thành công.'
        })
        router.push('/login') // điều hướng về trang login
    } catch (error) {
        notification.error({
            message: 'Lỗi đăng xuất',
            description: error?.response?.data?.message || 'Không thể đăng xuất'
        })
    }
}
onMounted(async () => {
    await authStore.fetchMe()
})
</script>


<style scoped>
::v-deep(.ant-menu) {
    border-inline-end: none !important;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 0 16px;
    background-color: #ffffff;
    /* ✅ thêm dòng này */
}


.header-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.header__logo {
    height: 55px;
}

.mobile-menu-icon {
    font-size: 22px;
    cursor: pointer;
    color: #333;
    /* ✅ đổi từ trắng thành xám đậm */
}


.mobile-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.mobile-user {
    margin-top: auto;
    /* đẩy xuống cuối */
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
}

.user-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.user-email {
    font-size: 13px;
    color: #666;
    margin-bottom: 16px;
}
</style>
