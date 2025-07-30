<template>
    <a-layout-header class="header">
        <div class="header-desktop" style="display: flex; align-items: center; gap: 8px;">
            <!-- Nút Trợ lý AI riêng biệt -->
            <a-tooltip title="Trợ lý AI">
                <a-button shape="circle" type="text" @click="handleClickAI"
                    style="width: 40px; height: 40px; font-size: 20px;">
                    <RobotOutlined />
                </a-button>
            </a-tooltip>

            <a-dropdown placement="bottomRight" trigger="click">

                <a class="header__user" @click.prevent>
                    <a-avatar :size="32" :src="avatar" />
                    <div class="user-meta">
                        <div class="header__username">{{ authStore.user?.name }}</div>
                        <div class="header__position">{{ authStore.user?.position_detail }}</div>
                    </div>
                </a>
                <template #overlay>
                    <a-menu class="custom-dropdown-menu">
                        <a-menu-item key="1">
                            <template #icon>
                                <SettingOutlined />
                            </template>
                            <router-link to="/settings"> Cài đặt hệ thống</router-link>
                        </a-menu-item>
                        <a-menu-item v-if="authStore.user?.is_admin != 0" key="5">
                            <template #icon>
                                <AppstoreOutlined />
                            </template>
                            <router-link to="/module-management">Quản lý chức năng</router-link>
                        </a-menu-item>
                        <a-menu-item key="2">
                            <template #icon>
                                <InfoCircleOutlined />
                            </template>
                            <router-link to="/profile"> Thông tin người dùng</router-link>
                        </a-menu-item>
                        <a-menu-item key="4" @click="changePassVisible = true">
                            <template #icon>
                                <KeyOutlined />
                            </template>
                            Đổi mật khẩu
                        </a-menu-item>

                        <a-menu-item key="3" danger @click="logout">
                            <template #icon>
                                <LogoutOutlined />
                            </template>
                            Đăng xuất
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
        <ChangePasswordModal :visible="changePassVisible" @update:visible="changePassVisible = $event" />
        <AIChatDrawer :visible="aiVisible" @update:visible="aiVisible = $event" />
    </a-layout-header>
</template>

<script setup>
import {
    SettingOutlined,
    InfoCircleOutlined,
    LogoutOutlined,
    KeyOutlined,
    RobotOutlined,
    AppstoreOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { onMounted, computed, ref } from 'vue'
import { resolveStoragePath } from '@/utils/storage'
import ChangePasswordModal from '@/components/common/ChangePasswordModal.vue'
import AIChatDrawer from '../common/AIChatDrawer.vue'
const aiVisible = ref(false)
const handleClickAI = () => {
    aiVisible.value = true
}
const authStore = useAuthStore()

const changePassVisible = ref(false)
const router = useRouter()

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
const avatar = computed(() =>
    authStore.user?.avatar ? resolveStoragePath(authStore.user.avatar) : ''
)

onMounted(async () => {
    await authStore.fetchMe()
})
</script>

<style scoped>
.header {
    background: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 64px;
    position: relative;
    z-index: 10;
    /* cao hơn marquee nếu cần */
}

.header__user {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.user-meta {
    display: flex;
    flex-direction: column;
    line-height: 1.6;
}

.header__username {
    font-weight: 500;
    color: #333;
    font-size: 16px;
}

.header__position {
    font-size: 12px;
    color: #888;
}
</style>
