<template>
    <!-- UI search only, không xử lý -->
    <a-form layout="vertical" class="fi-search">
        <a-row :gutter="[8, 8]" align="bottom">
            <a-col :xs="24" :sm="12" :md="8" :lg="6">
                <a-form-item label="Từ khoá" class="mb-0">
                    <a-input v-model:value="state" placeholder="Tìm theo nội dung, thiết bị, số HĐ..."
                        class="search-box" @change="emit('search', state)" />
                </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="2">
                <a-form-item label="&nbsp;" class="mb-0">
                    <a-button type="primary" block @click="onExport">
                        <template #icon>
                            <FileExcelOutlined />
                        </template>
                        Xuất Excel
                    </a-button>
                </a-form-item>
            </a-col>
        </a-row>
    </a-form>
</template>

<script setup>
import { computed } from 'vue'
import { FileExcelOutlined } from '@ant-design/icons-vue'

const props = defineProps({
    modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'search'])

const state = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<style scoped>
.search-box {
    max-width: 360px;
    width: 100%;
}
</style>
