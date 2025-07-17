<template>
    <div style="display: flex; gap: 12px; align-items: center">
        <!-- 👁 Xem -->
        <EyeOutlined v-if="showView" style="color: #1890ff; cursor: pointer; font-size: 18px" @click="$emit('view')" />

        <!-- ✏️ Sửa -->
        <EditOutlined v-if="showEdit" style="color: #faad14; cursor: pointer; font-size: 18px" @click="$emit('edit')" />

        <!-- ✅ Lưu -->
        <CheckOutlined v-if="showSave" style="color: #52c41a; cursor: pointer; font-size: 18px"
            @click="$emit('save')" />

        <!-- ❌ Huỷ -->
        <CloseOutlined v-if="showCancel" style="color: #8c8c8c; cursor: pointer; font-size: 18px"
            @click="$emit('cancel')" />

        <!-- 🗑 Xoá -->
        <DeleteOutlined v-if="showDelete" style="color: #f5222d; cursor: pointer; font-size: 18px"
            @click="$emit('delete')" />
    </div>
</template>

<script setup>
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons-vue'

defineProps({
    showView: { type: Boolean, default: true },
    showEdit: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    showSave: { type: Boolean, default: false },
    showCancel: { type: Boolean, default: false }
})
</script>
