<template>
    <a-card title="Tạo giấy ra vào cổng">
        <a-form :model="formState" layout="vertical">
            <a-divider orientation="left" orientation-margin="0px">Thông tin nhân sự</a-divider>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Mã nhân viên">
                        <a-input v-model:value="formState.msnv" :disabled="true" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Họ và tên">
                        <a-input v-model:value="formState.fullName" :disabled="true" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Phòng ban">
                        <a-input v-model:value="formState.department" :disabled="true" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Chức vụ">
                        <a-input v-model:value="formState.position" :disabled="true" />
                    </a-form-item>
                </a-col>
            </a-row>
            <!-- Nội dung -->
            <a-divider orientation="left" orientation-margin="0px">Nội dung ra vào cổng</a-divider>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Từ ngày">
                        <a-date-picker v-model:value="formState.fromDate" format="DD/MM/YYYY HH:mm" show-time
                            style="width: 100%" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Đến ngày">
                        <a-date-picker v-model:value="formState.toDate" format="DD/MM/YYYY HH:mm" show-time
                            style="width: 100%" />
                    </a-form-item>
                </a-col>
            </a-row>


            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Lý do ra/vào cổng" label-align="top">
                        <a-textarea v-model:value="formState.reason" rows="3" placeholder="Nhập lý do"
                            style="width: 100%" />
                    </a-form-item>
                </a-col>
            </a-row>


            <!-- Ngày tạo -->
            <a-form-item label="Ngày tạo phiếu" :label-col="{ span: 1.5 }" :wrapper-col="{ span: 22.5 }">
                <a-date-picker v-model:value="formState.createdAt" format="DD/MM/YYYY" style="width: 100%"
                    :value-format="'YYYY-MM-DD'" :disabled="true" />
            </a-form-item>


            <!-- Phê duyệt -->
            <a-divider orientation="left" orientation-margin="0px">Phê duyệt</a-divider>
            <a-form-item label="Quản lý trực tiếp">
                <a-select show-search placeholder="Chọn quản lý" :filter-option="filterManager"
                    v-model:value="formState.manager">
                    <a-select-option v-for="m in managerList" :key="m" :value="m">{{ m }}</a-select-option>
                </a-select>
            </a-form-item>

            <!-- Nút tạo phiếu -->
            <a-form-item :wrapper-col="{ span: 24 }" style="text-align: center;">
                <a-button type="primary" @click="submitForm">Tạo phiếu</a-button>
            </a-form-item>
        </a-form>
    </a-card>
    <div v-if="showPreview" class="preview-overlay">
        <div class="preview-dialog">
            <ReviewLeaveForm v-if="showPreview" :visible="showPreview" :data="formState"
                @update:visible="showPreview = $event" />

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ReviewLeaveForm from './ReviewLeaveForm.vue'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
const userAuth = useAuthStore()

const showPreview = ref(false)

const formState = ref({
    employeeCode: '',
    fullName: '',
    department: '',
    position: '',
    fromDate: dayjs().hour(7).minute(30).second(0),
    toDate: dayjs().hour(16).minute(30).second(0),
    reason: '',
    createdAt: dayjs().format('YYYY-MM-DD'),
    manager: '',
})

const managerList = ref([
    'Nguyễn Văn A',
    'Trần Thị B',
    'Phạm Văn C',
    'Lê Thị D',
])

const filterManager = (input, option) => {
    return option.value.toLowerCase().includes(input.toLowerCase())
}

const submitForm = () => {
    console.log('Form data:', formState.value)
    showPreview.value = true
}
onMounted(async () => {
    await userAuth.fetchMe()
    const user = userAuth.user
    if (user) {
        formState.value.msnv = user.msnv || ''
        formState.value.fullName = user.name || ''
        formState.value.department = user.department?.name || ''
        formState.value.position = user.position?.name || ''
    }
})
</script>

<style scoped>
.preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    /* nền mờ */
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-dialog {
    background: white;
    padding: 24px;
    border-radius: 4px;
    width: 850px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}
</style>
