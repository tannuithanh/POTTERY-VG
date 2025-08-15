<template>
    <a-card title="Phiếu đề nghị điều động xe">
        <a-form :model="formState" layout="vertical">
            <!-- THÔNG TIN NHÂN SỰ (đọc-only) -->
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

            <!-- NỘI DUNG ĐIỀU ĐỘNG XE -->
            <a-divider orientation="left">Nội dung điều động xe</a-divider>
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Xe ô tô" required>
                        <a-input v-model:value="formState.carText"/>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Tài xế" required>
                        <a-input v-model:value="formState.driverText" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Thời gian sử dụng (từ)" required>
                        <a-date-picker v-model:value="formState.fromDate" format="DD/MM/YYYY HH:mm" show-time
                            style="width:100%" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Thời gian sử dụng (đến)" required>
                        <a-date-picker v-model:value="formState.toDate" format="DD/MM/YYYY HH:mm" show-time
                            style="width:100%" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Lộ trình - Từ" required>
                        <a-input v-model:value="formState.routeFrom"  />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Lộ trình - Đến" required>
                        <a-input v-model:value="formState.routeTo" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-form-item label="Lý do sử dụng xe" required>
                <a-textarea v-model:value="formState.reason" rows="3" />
            </a-form-item>

            <a-form-item label="Ngày tạo phiếu">
                <a-date-picker v-model:value="formState.createdAt" format="DD/MM/YYYY" value-format="YYYY-MM-DD"
                    disabled style="width:100%" />
            </a-form-item>

            <!-- PHÊ DUYỆT -->
            <a-divider orientation="left">Người duyệt</a-divider>
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Chọn người ký duyệt" required>
                        <a-select v-model:value="formState.approverId" show-search placeholder="Tìm và chọn người duyệt"
                            :options="userOptions" :filter-option="filterByLabel" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- NÚT -->
            <a-form-item style="text-align:center;">
                <a-button type="primary" @click="handlePreview">Tạo phiếu</a-button>
            </a-form-item>
        </a-form>
    </a-card>

    <!-- Preview -->
    <ReviewVehicleDispatchForm :visible="showPreview" :data="formState" :users="userOptionsRaw"
        :managerId="formState.approverId"
        :meta="{ formCode: 'HCNS-QT09-BM05', revision: '03', revisionDate: '14/05/2025' }"
        @update:visible="showPreview = $event" @submit="createFormInstance" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import ReviewVehicleDispatchForm from './ReviewVehicleDispatchForm.vue'
const userAuth = useAuthStore()

const showPreview = ref(false)
const userOptions = ref([]) // options cho select người duyệt
const userOptionsRaw = ref([])   // ✅ mảng user thô để truyền cho modal

const formState = ref({
    // nhân sự (readonly)
    msnv: '',
    fullName: '',
    department: '',
    position: '',
    // nội dung xe (nhập tay)
    carText: '',
    driverText: '',
    fromDate: dayjs().hour(7).minute(30),
    toDate: dayjs().hour(16).minute(30),
    routeFrom: '',
    routeTo: '',
    reason: '',
    // meta
    createdAt: dayjs().format('YYYY-MM-DD'),
    // phê duyệt
    approverId: null
})

const filterByLabel = (input, option) =>
    option?.label?.toLowerCase?.().includes(input.toLowerCase())

const handlePreview = () => {
    const f = formState.value
    if (!f.carText?.trim()) return notification.warning({ message: 'Thiếu thông tin', description: 'Nhập tên/biển số xe.' })
    if (!f.driverText?.trim()) return notification.warning({ message: 'Thiếu thông tin', description: 'Nhập tên tài xế.' })
    if (!f.fromDate || !f.toDate) return notification.warning({ message: 'Thiếu thông tin', description: 'Chọn thời gian sử dụng.' })
    if (dayjs(f.toDate).isBefore(dayjs(f.fromDate)))
        return notification.warning({ message: 'Thời gian không hợp lệ', description: '"Đến" phải ≥ "Từ".' })
    if (!f.routeFrom?.trim() || !f.routeTo?.trim())
        return notification.warning({ message: 'Thiếu thông tin', description: 'Nhập lộ trình (từ/đến).' })
    if (!f.reason?.trim())
        return notification.warning({ message: 'Thiếu thông tin', description: 'Nhập lý do sử dụng xe.' })
    if (!f.approverId)
        return notification.warning({ message: 'Thiếu thông tin', description: 'Chọn người ký duyệt.' })
    showPreview.value = true
}


const createFormInstance = async (payload) => {
    try {
        // dùng API thực tế của bạn
        await (formInstanceService.createCarDispatch?.(payload) || formInstanceService.createGatePass(payload))
        notification.success({ message: 'Tạo phiếu thành công', description: 'Phiếu điều động xe đã được gửi duyệt.' })
        resetForm()
        showPreview.value = false
    } catch (error) {
        notification.error({
            message: 'Lỗi tạo phiếu',
            description: error?.response?.data?.message || 'Vui lòng thử lại.'
        })
    }
}

const resetForm = () => {
    formState.value = {
        msnv: userAuth.user?.msnv || '',
        fullName: userAuth.user?.name || '',
        department: userAuth.user?.department?.name || '',
        position: userAuth.user?.position?.name || '',
        carText: '',
        driverText: '',
        fromDate: dayjs().hour(7).minute(30),
        toDate: dayjs().hour(16).minute(30),
        routeFrom: '',
        routeTo: '',
        reason: '',
        createdAt: dayjs().format('YYYY-MM-DD'),
        approverId: null
    }
}

onMounted(async () => {
    resetForm()
    try {
        // Lấy toàn bộ user cho select người duyệt
        const res = await userService.getAll()
        const users = res?.data || []
        userOptionsRaw.value = users     // ✅ truyền lên modal dùng để find tên
        userOptions.value = users.map(u => ({
            value: u.id,
            label: [u.name, u?.department?.name, u?.msnv].filter(Boolean).join(' — ')
        }))
    } catch (error) {
        notification.error({
            message: 'Lỗi tải danh sách người duyệt',
            description: error?.response?.data?.message || 'Vui lòng thử lại.'
        })
    }
})
</script>
