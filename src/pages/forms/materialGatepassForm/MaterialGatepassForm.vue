<template>
    <a-card title="Tạo phiếu mang vật tư ra cổng">
        <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
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

            <a-divider orientation="left">Nội dung</a-divider>

            <!-- NGÀY PHIẾU -->
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Ngày" name="docDate">
                        <a-date-picker v-model:value="formState.docDate" format="DD/MM/YYYY" style="width: 100%"
                            placeholder="Chọn ngày phiếu" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- LOẠI PHIẾU -->
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Loại phiếu" name="gatepassType">
                        <a-radio-group v-model:value="formState.gatepassType" button-style="solid">
                            <a-radio-button value="goods">Hàng hóa, vật tư</a-radio-button>
                            <a-radio-button value="scrap">Thanh lý phế liệu</a-radio-button>
                            <a-radio-button value="pottery">Chậu/tượng</a-radio-button>
                        </a-radio-group>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- NGƯỜI MANG RA CỔNG -->
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Người mang ra cổng" name="carrierName">
                        <a-input v-model:value="formState.carrierName" placeholder="Nhập tên người mang ra cổng" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- BIỂN SỐ XE -->
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item label="Biển số xe" name="vehiclePlate">
                        <a-input v-model:value="formState.vehiclePlate" placeholder="VD: 51A-123.45" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- HÀNG HÓA / VẬT TƯ -->
            <a-row :gutter="16">
                <a-col :span="16">
                    <a-form-item label="Tên hàng hóa, vật tư" name="itemName">
                        <a-input v-model:value="formState.itemName"
                            placeholder="Nhập tên hàng hóa, vật tư mang ra cổng" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Số lượng" name="quantity">
                        <a-input-number v-model:value="formState.quantity" :min="1" :step="1" style="width: 100%"
                            placeholder="Nhập số lượng" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- LÝ DO -->
            <a-form-item label="Lý do" name="reason">
                <a-textarea v-model:value="formState.reason" rows="3" placeholder="Nhập lý do mang vật tư ra cổng" />
            </a-form-item>

            <!-- NGƯỜI DUYỆT -->
            <a-divider orientation="left">Người duyệt</a-divider>
            <a-row :gutter="16">
                <a-col :span="24">
                    <a-form-item
                        :label="formState.gatepassType === 'goods' ? 'Chọn Trưởng bộ phận' : 'Chọn người ký duyệt'"
                        name="approverId" required>
                        <a-select v-model:value="formState.approverId" show-search placeholder="Tìm và chọn người duyệt"
                            :options="userOptions" :filter-option="filterByLabel" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- ACTIONS -->
            <div style="text-align:center">
                <a-button type="primary" :loading="submitting" @click="onSubmit">Tạo phiếu</a-button>
            </div>
        </a-form>
    </a-card>

    <!-- PREVIEW -->
    <ReviewMaterialGatepassForm :visible="showPreview" :data="formState" :users="approverUsers"
        :approverId="formState.approverId" @update:visible="val => (showPreview = val)" @success="onReset()" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import ReviewMaterialGatepassForm from './ReviewMaterialGatepassForm.vue'

const showPreview = ref(false)
const formRef = ref()
const submitting = ref(false)

const userAuth = useAuthStore()

// chọn người duyệt
const userOptions = ref([])   // { value, label }
const approverUsers = ref([]) // { id, name } cho modal preview

const formState = ref({
    // nhân sự
    msnv: '',
    fullName: '',
    department: '',
    position: '',

    // phiếu
    docDate: dayjs(),
    gatepassType: 'goods',      // 'goods' | 'scrap' | 'pottery'
    carrierName: '',
    vehiclePlate: '',
    itemName: '',
    quantity: null,
    reason: '',

    // giữ tương thích (preview cũ)
    isScrapLiquidation: false,

    // duyệt
    approverId: undefined
})

const rules = {
    docDate: [{ required: true, message: 'Vui lòng chọn ngày phiếu' }],
    gatepassType: [{ required: true, message: 'Vui lòng chọn loại phiếu' }],
    carrierName: [{ required: true, message: 'Vui lòng nhập người mang ra cổng' }],
    vehiclePlate: [{ required: true, message: 'Vui lòng nhập biển số xe' }],
    itemName: [{ required: true, message: 'Vui lòng nhập tên hàng hóa, vật tư' }],
    quantity: [
        { required: true, message: 'Vui lòng nhập số lượng' },
        { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
    ],
    reason: [{ required: true, message: 'Vui lòng nhập lý do' }],
    approverId: [{ required: true, message: 'Vui lòng chọn người ký duyệt' }]
}

// đồng bộ cờ cũ
watch(
    () => formState.value.gatepassType,
    (val) => { formState.value.isScrapLiquidation = (val === 'scrap') },
    { immediate: true }
)

function fillEmployeeInfo() {
    formState.value.msnv = userAuth.user?.msnv || ''
    formState.value.fullName = userAuth.user?.name || ''
    formState.value.department = userAuth.user?.department?.name || ''
    formState.value.position = userAuth.user?.position?.name || ''
}

const filterByLabel = (input, option) => option?.label?.toLowerCase?.().includes(input.toLowerCase())

const onReset = () => {
    formState.value = {
        msnv: '',
        fullName: '',
        department: '',
        position: '',

        docDate: dayjs(),
        gatepassType: 'goods',
        carrierName: '',
        vehiclePlate: '',
        itemName: '',
        quantity: null,
        reason: '',

        isScrapLiquidation: false,
        approverId: undefined
    }
    fillEmployeeInfo()
}

const onSubmit = () => {
    formRef.value.validate()
        .then(() => { showPreview.value = true })
        .catch(() => { })
}

function normalizeUsersResponse(res) {
    const raw = res?.data ?? res
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.items)) return raw.items
    if (Array.isArray(raw?.results)) return raw.results
    if (Array.isArray(raw?.data)) return raw.data
    return []
}

onMounted(async () => {
    fillEmployeeInfo()
    try {
        const res = await userService.getAll()
        const users = normalizeUsersResponse(res)

        approverUsers.value = users.map(u => ({
            id: u.id,
            name: u.name || u.full_name || u.username || ''
        }))

        userOptions.value = users.map(u => ({
            value: u.id,
            label: [u.name || u.full_name || u.username || '', u.department?.name || u.department || '', u.position?.name || u.position || '']
                .filter(Boolean)
                .join(' - ')
        }))
    } catch (_) {
        approverUsers.value = []
        userOptions.value = []
    }
})
</script>
