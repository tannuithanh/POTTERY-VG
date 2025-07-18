<template>
    <a-layout>
        <a-layout-header style="background: #fff; padding: 0 16px">
            <a-menu mode="horizontal" :selectedKeys="[selectedKey]" style="border-bottom: none" router>
                <a-menu-item key="user_manager">
                    <template #icon>
                        <UserOutlined />
                    </template>
                    <router-link :to="{ name: 'userManager' }">Quản lý người dùng</router-link>
                </a-menu-item>

                <a-menu-item key="department_manager">
                    <template #icon>
                        <ApartmentOutlined />
                    </template>
                    <router-link :to="{ name: 'departmentManager' }">Quản lý bộ phận</router-link>
                </a-menu-item>

                <a-menu-item key="module_manager">
                    <template #icon>
                        <ControlOutlined />
                    </template>
                    <router-link :to="{ name: 'moduleManager' }">Quản lý chức năng</router-link>
                </a-menu-item>

                <a-menu-item key="role_permission">
                    <template #icon>
                        <SafetyOutlined />
                    </template>
                    <router-link :to="{ name: 'rolePermissionManager' }">Quản lý vai trò & Quyền chức năng</router-link>
                </a-menu-item>

                <a-menu-item key="permission_assign">
                    <template #icon>
                        <KeyOutlined />
                    </template>
                    <router-link :to="{ name: 'Decentralization' }">Quản lý phân quyền</router-link>
                </a-menu-item>




                <!-- <a-menu-item key="gatepass">
                    <template #icon>
                        <FileProtectOutlined />
                    </template>
                    <router-link>Cài đặt giấy ra vào</router-link>
                </a-menu-item>

                <a-menu-item key="newsboard">
                    <template #icon>
                        <ProfileOutlined />
                    </template>
                    <router-link :to="{ name: 'newsManager' }">Cài đặt bản tin</router-link>
                </a-menu-item> -->
            </a-menu>
        </a-layout-header>

        <!-- Nội dung -->
        <a-layout-content style="padding: 16px; background: #fff">
            <router-view />
        </a-layout-content>
    </a-layout>
</template>


<script setup>
import {
    UserOutlined,
    ApartmentOutlined,
    FileProtectOutlined,
    ProfileOutlined,
    ControlOutlined,
    SafetyOutlined,
    KeyOutlined
} from '@ant-design/icons-vue'

import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const selectedKey = computed(() => route.name)
</script>



<style scoped>
/* Hiển thị scroll khi thu nhỏ màn hình */
::v-deep(.ant-layout-header) {
    overflow-x: auto;
    white-space: nowrap;
}

/* Tùy chọn: ẩn thanh cuộn xấu xí trên một số trình duyệt */
::v-deep(.ant-layout-header::-webkit-scrollbar) {
    display: none;
}

::v-deep(.ant-menu-horizontal) {
    flex-wrap: nowrap;
    min-width: max-content;
}

/* Màu khi hover & chọn */
::v-deep(.ant-menu-horizontal > .ant-menu-item:hover::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-active::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-selected::after) {
    border-bottom: 2px solid #c06252 !important;
}

::v-deep(.ant-menu-horizontal > .ant-menu-item-selected) {
    color: #c06252 !important;
}
</style>
