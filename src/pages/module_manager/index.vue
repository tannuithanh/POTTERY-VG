<template>
    <a-card>
        <a-menu mode="horizontal" v-model:selectedKeys="selectedKeys" style="border-bottom: none">
            <a-menu-item key="forms">Biểu mẫu</a-menu-item>
            <a-menu-item key="news">Cài đặt bảng tin</a-menu-item>
        </a-menu>

        <div style="margin-top: 16px;">
            <FormList v-if="selectedKeys[0] === 'forms'" />
            <NewsSetting v-if="selectedKeys[0] === 'news'"/>
        </div>
    </a-card>
</template>

<script setup>
import { ref } from 'vue'
import FormList from './forms/FormList.vue'
import NewsSetting from './forms/NewsSetting.vue';


const selectedKeys = ref(['forms'])
</script>

