<template>
    <div style="display: flex; gap: 12px; align-items: center">
        <EyeOutlined v-if="showView" style="color: #1890ff; cursor: pointer; font-size: 18px" @click="$emit('view')" />
        <EditOutlined v-if="showEdit" style="color: #faad14; cursor: pointer; font-size: 18px" @click="$emit('edit')" />
        <DeleteOutlined v-if="showDelete" style="color: #f5222d; cursor: pointer; font-size: 18px"
            @click="$emit('delete')" />
    </div>
</template>

<script setup>
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

defineProps({
    showView: { type: Boolean, default: true },
    showEdit: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true }
})
</script>
