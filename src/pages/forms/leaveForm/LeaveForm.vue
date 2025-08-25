<template>
    <a-card title="Tạo giấy ra vào cổng">
        <a-form :model="formState" layout="vertical">
            <!-- THÔNG TIN NHÂN SỰ -->
            <a-divider orientation="left">Thông tin nhân sự</a-divider>
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Mã nhân viên">
                        <a-input v-model:value="formState.msnv" disabled />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Họ và tên">
                        <a-input v-model:value="formState.fullName" disabled />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Phòng ban">
                        <a-input v-model:value="formState.department" disabled />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Chức vụ">
                        <a-input v-model:value="formState.position" disabled />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- NỘI DUNG -->
            <a-divider orientation="left">Nội dung ra vào cổng</a-divider>
            <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Từ ngày">
                <a-date-picker v-model:value="formState.fromDate" format="DD/MM/YYYY HH:mm" show-time style="width: 100%" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="Đến ngày">
                <a-date-picker v-model:value="formState.toDate" format="DD/MM/YYYY HH:mm" show-time style="width: 100%" />
                </a-form-item>
            </a-col>
            </a-row>

            <!-- NEW: Mục đích (bắt buộc) -->
            <a-form-item label="Lý do" required>
            <a-radio-group v-model:value="formState.purposeType">
                <a-radio value="personal">Việc cá nhân</a-radio>
                <a-radio value="company">Việc công ty</a-radio>
            </a-radio-group>
            </a-form-item>

            <!-- CHANGED: Ghi chú (không bắt buộc) -->
            <a-form-item label="Ghi chú (tuỳ chọn)">
            <a-textarea v-model:value="formState.note" rows="3" allow-clear />
            </a-form-item>


            <!-- NGÀY TẠO -->
            <a-form-item label="Ngày tạo phiếu">
                <a-date-picker v-model:value="formState.createdAt" format="DD/MM/YYYY" value-format="YYYY-MM-DD"
                    disabled style="width: 100%" />
            </a-form-item>

            <!-- PHÊ DUYỆT -->
            <a-divider orientation="left">Phê duyệt</a-divider>
            <a-form-item label="Quản lý trực tiếp" required>
                <a-select show-search placeholder="Chọn quản lý" v-model:value="formState.managerId"
                    :filter-option="filterManager">
                    <a-select-option v-for="m in managerList" :key="m.id" :value="m.id">
                        {{ m.name }}
                    </a-select-option>
                </a-select>

            </a-form-item>

            <!-- NÚt -->
            <a-form-item style="text-align: center;">
                <a-button type="primary" @click="handlePreview">Tạo phiếu</a-button>
            </a-form-item>
        </a-form>
    </a-card>

    <ReviewLeaveForm :visible="showPreview" :managers="managerList" :data="formState" @update:visible="showPreview = $event"
        @submit="createFormInstance" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import ReviewLeaveForm from './ReviewLeaveForm.vue'
import userService from '@/services/userService'
import { formInstanceService } from '@/services/form_service/formInstanceService'

const showPreview = ref(false)
const managerList = ref([])

const formState = ref({
  msnv: '',
  fullName: '',
  department: '',
  position: '',
  fromDate: dayjs().hour(7).minute(30),
  toDate: dayjs().hour(16).minute(30),
  note: '',       
  purposeType: '',
  createdAt: dayjs().format('YYYY-MM-DD'),
  manager: '',
  managerId: '',
})

const userAuth = useAuthStore()

const filterManager = (input, option) =>
    option?.value?.toLowerCase().includes(input.toLowerCase())

const handlePreview = () => {
  // validate mới: yêu cầu chọn Mục đích
  if (!formState.value.purposeType) {
    return notification.warning({
      message: 'Thiếu thông tin',
      description: 'Vui lòng chọn Mục đích (Việc cá nhân hoặc Việc công ty).',
    })
  }
  // kiểm tra khoảng thời gian hợp lệ (khuyến nghị)
  if (formState.value.fromDate && formState.value.toDate && dayjs(formState.value.fromDate).isAfter(formState.value.toDate)) {
    return notification.warning({
      message: 'Khoảng thời gian chưa hợp lệ',
      description: '“Từ ngày” phải trước “Đến ngày”.',
    })
  }
  // bắt buộc chọn quản lý như cũ
  if (!formState.value.managerId) {
    return notification.warning({
      message: 'Thiếu thông tin',
      description: 'Vui lòng chọn quản lý trực tiếp.',
    })
  }
  showPreview.value = true
}

const createFormInstance = async (payload) => {
    try {
        await formInstanceService.createGatePass(payload)

        notification.success({
            message: 'Tạo phiếu thành công',
            description: 'Phiếu ra vào cổng đã được gửi duyệt.',
        })

        // 🔁 Reset form
        resetForm()

        // ✅ Đóng modal preview
        showPreview.value = false
    } catch (error) {
        notification.error({
            message: 'Lỗi tạo phiếu',
            description: error?.response?.data?.message || 'Vui lòng thử lại.',
        })
    }
}
const resetForm = () => {
  formState.value = {
    msnv: userAuth.user?.msnv || '',
    fullName: userAuth.user?.name || '',
    department: userAuth.user?.department?.name || '',
    position: userAuth.user?.position?.name || '',
    fromDate: dayjs().hour(7).minute(30),
    toDate: dayjs().hour(16).minute(30),
    note: '',           // reset ghi chú
    purposeType: '',    // reset mục đích
    createdAt: dayjs().format('YYYY-MM-DD'),
    manager: '',
    managerId: '',
  }
}

onMounted(async () => {
    resetForm()

    try {
        const res = await userService.getManagers()
        managerList.value = res.data
    } catch (error) {
        notification.error({
            message: 'Lỗi tải danh sách quản lý',
            description: error?.response?.data?.message || 'Vui lòng thử lại.',
        })
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
