<template>
    <a-card>
        <a-menu mode="horizontal" v-model:selectedKeys="selectedKeys" style="border-bottom: none">
            <a-menu-item key="forms">Biểu mẫu</a-menu-item>
            <a-menu-item key="instances">Danh sách phiếu</a-menu-item>
        </a-menu>

        <div style="margin-top: 16px;">
            <FormList v-if="selectedKeys[0] === 'forms'" />
        </div>
    </a-card>
</template>

<script setup>
import { ref } from 'vue'
import FormList from './forms/FormList.vue'


const selectedKeys = ref(['forms'])
</script>

<style scoped>
/* ✅ Tùy chỉnh menu khi active/hover */
::v-deep(.ant-menu-horizontal) {
    flex-wrap: nowrap;
    min-width: max-content;
}

::v-deep(.ant-menu-horizontal > .ant-menu-item:hover::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-active::after),
::v-deep(.ant-menu-horizontal > .ant-menu-item-selected::after) {
    border-bottom: 2px solid #c06252 !important;
}

::v-deep(.ant-menu-horizontal > .ant-menu-item-selected) {
    color: #c06252 !important;
}
</style>
