<template>
    <a-layout-header class="header">
        <div class="header-desktop">
            <a-dropdown placement="bottomRight" trigger="click">
                <a class="header__user" @click.prevent>
                    <a-avatar :size="32" src="https://i.pravatar.cc/150?img=3" />
                    <div class="user-meta">
                        <div class="header__username">Chookie</div>
                        <div class="header__position">Chuyên viên quản lý phần mềm</div>
                    </div>
                </a>

                <template #overlay>
                    <a-menu class="custom-dropdown-menu">
                        <a-menu-item key="1" :to="'/settings'">
                            <template #icon>
                                <SettingOutlined />
                            </template>
                            <router-link to="/settings"> Cài đặt hệ thống</router-link>
                        </a-menu-item>

                        <a-menu-item key="2">
                            <template #icon>
                                <InfoCircleOutlined />
                            </template>
                            <router-link to="/profile"> Thông tin người dùng</router-link>
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
    </a-layout-header>
</template>

<script setup>
import {
    SettingOutlined,
    InfoCircleOutlined,
    LogoutOutlined
} from '@ant-design/icons-vue'

function logout() {
    console.log('Logging out...')
}
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
