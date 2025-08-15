<template>
    <a-form layout="vertical" class="fi-search">
        <a-row :gutter="[8, 8]" align="bottom">
            <!-- Từ khoá -->
            <a-col :xs="24" :sm="12" :md="8" :lg="6">
                <a-form-item label="Từ khoá" class="mb-0">
                    <a-input v-model:value="filters.keyword" placeholder="Tiêu đề hoặc người tạo..." allow-clear
                        @input="emitSearch" />
                </a-form-item>
            </a-col>

            <!-- Khoảng ngày tạo -->
            <a-col :xs="24" :sm="12" :md="8" :lg="6">
                <a-form-item label="Khoảng ngày tạo" class="mb-0">
                    <a-range-picker v-model:value="filters.dateRange" format="DD/MM/YYYY" allow-clear
                        style="width: 100%" placeholder="Chọn khoảng ngày tạo" @change="emitSearch" />
                </a-form-item>
            </a-col>

            <!-- Loại biểu mẫu -->
            <a-col v-if="showFormFilter" :xs="24" :sm="12" :md="8" :lg="6">
                <a-form-item label="Loại biểu mẫu" class="mb-0">
                    <a-select v-model:value="filters.formCode" :options="formOptions" allow-clear show-search
                        optionFilterProp="label" placeholder="Chọn loại biểu mẫu" style="width: 100%"
                        @change="emitSearch" />
                </a-form-item>
            </a-col>

            <!-- Trạng thái -->
            <a-col v-if="showStatusFilter" :xs="24" :sm="12" :md="12" :lg="4">
                <a-form-item label="Trạng thái" class="mb-0">
                    <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="Tất cả"
                        style="width: 100%" @change="emitSearch" />
                </a-form-item>
            </a-col>

            <!-- Export -->
            <a-col v-if="canExport" :xs="24" :sm="12" :md="12" :lg="2">
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
import { ref, computed } from 'vue'
import { FileExcelOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    forms: {
        type: Array,
        default: () => ([
            { label: 'Tất cả', value: '' },
            { label: 'Giấy ra vào cổng', value: 'GateEntry' },
            { label: 'Phiếu yêu cầu điều động xe', value: 'VehicleDispatch' }
        ])
    },
    showFormFilter: { type: Boolean, default: true },
    showStatusFilter: { type: Boolean, default: true },
})

const emit = defineEmits(['search', 'export'])

const authStore = useAuthStore()
const canExport = computed(() => {
    const user = authStore.user
    const isAdmin = user?.is_admin == 1
    const formModule = user?.modules?.find(m => m.code === 'form')
    const hasPermission = formModule?.actions?.includes('export_excel')
    return isAdmin || hasPermission
})

const filters = ref({
    keyword: '',
    dateRange: [],
    formCode: '',
    status: null,
})

const formOptions = computed(() => props.forms)
const statusOptions = [
    { label: 'Đang chờ', value: 'pending' },
    { label: 'Đã duyệt', value: 'approved' },
    { label: 'Từ chối', value: 'rejected' },
]

function emitSearch() {
    emit('search', { ...filters.value })
}

function onExport() {
    emit('export', { ...filters.value })
}
</script>

<style scoped>
/* Thu nhỏ spacing cho form */
.fi-search :deep(.ant-form-item) {
    margin-bottom: 8px;
}

.fi-search :deep(.ant-form-item-label > label) {
    font-weight: 600;
}

/* Tránh cột bị cao quá khi chỉ có nút */
.mb-0 :deep(.ant-form-item-control-input) {
    min-height: 0;
}
</style>
