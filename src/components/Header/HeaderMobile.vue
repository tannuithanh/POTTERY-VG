<template>
    <a-layout-header class="header" >
        <div class="header-mobile">
            <img src="@/assets/images/logo.png" alt="Logo" class="header__logo" />
            <menu-outlined class="mobile-menu-icon" @click="drawerVisible = true" />

            <a-drawer  theme="light"  placement="left" width="280" :visible="drawerVisible" @close="drawerVisible = false">
                <div class="mobile-drawer">
                    <a-menu mode="inline" theme="light" :openKeys="openKeys" @openChange="onOpenChange"
                        @click="drawerVisible = false">
                        <a-menu-item key="home">
                            <router-link to="/">
                                <HomeOutlined />
                                <span>Trang chủ</span>
                            </router-link>
                        </a-menu-item>

                        <a-sub-menu key="user">
                            <template #title>
                                <span>
                                    <UserOutlined />
                                    <span>Quản lý người dùng</span>
                                </span>
                            </template>
                            <a-menu-item key="users">
                                <router-link to="/users">Danh sách người dùng</router-link>
                            </a-menu-item>
                            <a-menu-item key="roles">
                                <router-link to="/roles">Vai trò & quyền hạn</router-link>
                            </a-menu-item>
                        </a-sub-menu>
                    </a-menu>

                    <div class="mobile-user">
                        <a-avatar :size="80" :src="avatar" />
                        <div class="user-name">{{ authStore.user?.name }}</div>
                        <div class="user-email">{{ authStore.user?.position_detail }}</div>
                        <div class="user-actions">
                            <a-button type="text" block>
                                <SettingOutlined /> Change Password
                            </a-button>
                            <a-button type="primary" danger block @click="logout">
                                <LogoutOutlined /> Log out
                            </a-button>
                        </div>
                    </div>
                </div>
            </a-drawer>
        </div>
    </a-layout-header>
</template>

<script setup>
import {
    HomeOutlined,
    MenuOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { onMounted, computed } from 'vue'
import { resolveStoragePath } from '@/utils/storage'

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
onMounted(async() => {
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
  background-color: #ffffff; /* ✅ thêm dòng này */
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
  color: #333; /* ✅ đổi từ trắng thành xám đậm */
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

/* ✅ Style cho menu trong mobile drawer */
::v-deep(.ant-menu-light .ant-menu-item-selected),
::v-deep(.ant-menu-light .ant-menu-submenu-selected) {
  background-color: rgba(192, 98, 82, 0.1) !important;
  color: #c06252 !important;
}

::v-deep(.ant-menu-light .ant-menu-item:hover),
::v-deep(.ant-menu-light .ant-menu-submenu-title:hover) {
  background-color: rgba(192, 98, 82, 0.05) !important;
  color: #c06252 !important;
}

/* ✅ Icon bên trong menu */
::v-deep(.ant-menu-item .anticon),
::v-deep(.ant-menu-submenu-title .anticon) {
  color: #333; /* mặc định */
}

::v-deep(.ant-menu-light .ant-menu-item-selected .anticon),
::v-deep(.ant-menu-light .ant-menu-item:hover .anticon),
::v-deep(.ant-menu-light .ant-menu-submenu-title:hover .anticon) {
  color: #c06252 !important;
}

</style>
