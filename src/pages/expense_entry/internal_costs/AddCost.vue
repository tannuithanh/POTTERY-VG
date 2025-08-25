<template>
    <a-card title="Thêm chi phí nội bộ" :bordered="false">
        <a-form :model="form" :rules="rules" layout="vertical" @finish="onSubmit" @finishFailed="onFailed">
            <!-- Hàng 1: Ngày phát sinh + Bộ phận + Ghi chú -->
            <a-row :gutter="16">
                <a-col :xs="24" :md="8">
                    <a-form-item label="Ngày phát sinh chi phí" name="incurredDate">
                        <a-date-picker v-model:value="form.incurredDate" format="DD/MM/YYYY" style="width: 100%" />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="8">
                    <a-form-item label="Bộ phận được phân bổ chi phí" name="departmentId"
                        tooltip="Theo phụ lục quy định">
                        <a-select v-model:value="form.departmentId" :options="departmentOptions"
                            placeholder="Chọn bộ phận" allow-clear show-search :filter-option="filterOption" />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="8">
                    <a-form-item label="Ghi chú" name="note">
                        <a-input v-model:value="form.note"
                            placeholder="Ghi chú (ghi HHH nếu bút chung form Vĩnh Gia)" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Hàng 2: Nội dung chi phí -->
            <a-form-item label="Nội dung chi phí" name="content"
                tooltip="Nếu là vật tư thay thế nội bộ: ghi rõ tên vật tư & số lượng">
                <a-textarea v-model:value="form.content" :rows="3" placeholder="Nhập nội dung chi phí..." />
            </a-form-item>

            <!-- Hàng 3: Thiết bị (Tên, Mã, Loại) -->
            <a-row :gutter="16">
                <a-col :xs="24" :md="10">
                    <a-form-item label="Thiết bị - Tên thiết bị" name="deviceId">
                        <a-select v-model:value="form.deviceId" :options="deviceOptions" placeholder="Chọn thiết bị"
                            allow-clear show-search :filter-option="filterOption" @change="onDeviceChange" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :md="7">
                    <a-form-item label="Mã số thiết bị" name="deviceCode">
                        <a-input v-model:value="form.deviceCode" placeholder="Mã số thiết bị" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :md="7">
                    <a-form-item label="Loại thiết bị" name="deviceTypeId">
                        <a-select v-model:value="form.deviceTypeId" :options="deviceTypeOptions"
                            placeholder="Chọn loại thiết bị" allow-clear show-search :filter-option="filterOption" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Hàng 4: Chi phí phát sinh (không còn công tắc Có/Không) -->
            <a-row :gutter="16">
                <a-col :xs="24" :md="8">
                    <a-form-item label="Chi phí chính thức (VNĐ)" name="officialAmount">
                        <a-input-number v-model:value="form.officialAmount" :formatter="moneyFormatter"
                            :parser="moneyParser" :min="0" style="width: 100%"
                            placeholder="Giá trị theo hóa đơn (chưa VAT)" />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="8">
                    <a-form-item label="Số hóa đơn" name="invoiceNo">
                        <a-input v-model:value="form.invoiceNo" placeholder="Nhập số hóa đơn" allow-clear />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="8">
                    <a-form-item label="Chi phí khái toán/ấn (VNĐ)" name="estimatedAmount"
                        tooltip="Giá trị theo công thức/thực tế">
                        <a-input-number v-model:value="form.estimatedAmount" :formatter="moneyFormatter"
                            :parser="moneyParser" :min="0" style="width: 100%"
                            placeholder="Nhập chi phí khái toán/ấn" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Actions (giữa) -->
            <div style="display:flex; justify-content:center; margin-top: 8px;">
                <a-button type="primary" html-type="submit">Lưu chi phí</a-button>
            </div>
        </a-form>
    </a-card>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import departmentService from '@/services/departmentService' // đường dẫn theo file bạn đưa

/* ======= Options từ API / Mock ======= */
const departmentOptions = reactive([]) // [{ label: 'Phòng Kỹ thuật — PTK', value: 1, code:'PTK' }, ...]

const deviceTypeOptions = [
    { label: 'Máy chủ', value: 'type_server' },
    { label: 'Thiết bị mạng', value: 'type_network' },
    { label: 'Thiết bị văn phòng', value: 'type_office' }
]

const deviceOptions = [
    { label: 'Server A', value: 'dev001', code: 'SRV-A-001', typeId: 'type_server' },
    { label: 'Router Core', value: 'dev002', code: 'RTR-CORE-01', typeId: 'type_network' },
    { label: 'Máy in tầng 5', value: 'dev003', code: 'PRN-05-03', typeId: 'type_office' }
]

/* ======= Form state ======= */
const form = reactive({
    incurredDate: dayjs(),     // Ngày phát sinh
    content: '',               // Nội dung chi phí
    departmentId: undefined,   // ID bộ phận được phân bổ
    deviceId: undefined,       // Thiết bị (id)
    deviceCode: '',            // Mã số thiết bị
    deviceTypeId: undefined,   // Loại thiết bị
    officialAmount: null,      // Chi phí chính thức
    invoiceNo: '',             // Số hóa đơn
    estimatedAmount: null,     // Chi phí khái toán/ấn
    note: ''                   // Ghi chú
})

/* ======= Validate rules (tất cả bắt buộc) ======= */
const requiredMsg = (msg) => [{ required: true, message: msg }]
const positiveNumberRule = (msg) => [
    { required: true, message: msg },
    {
        validator: (_, v) => (v == null || Number(v) <= 0) ? Promise.reject(msg) : Promise.resolve()
    }
]

const rules = {
    incurredDate: requiredMsg('Chọn ngày phát sinh'),
    content: requiredMsg('Nhập nội dung chi phí'),
    departmentId: requiredMsg('Chọn bộ phận phân bổ'),
    deviceId: requiredMsg('Chọn thiết bị'),
    deviceCode: requiredMsg('Nhập mã số thiết bị'),
    deviceTypeId: requiredMsg('Chọn loại thiết bị'),
    officialAmount: positiveNumberRule('Nhập chi phí chính thức (VNĐ) > 0'),
    invoiceNo: requiredMsg('Nhập số hóa đơn'),
    estimatedAmount: positiveNumberRule('Nhập chi phí khái toán/ấn (VNĐ) > 0'),
    note: requiredMsg('Nhập ghi chú')
}

/* ======= Utils ======= */
const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

const moneyFormatter = (value) =>
    value == null ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const moneyParser = (value) => value?.replace?.(/,/g, '')?.replace(/[^\d.-]/g, '') ?? ''

/* ======= Effects ======= */
const onDeviceChange = (val) => {
    const found = deviceOptions.find(d => d.value === val)
    if (found) {
        form.deviceCode = found.code
        form.deviceTypeId = found.typeId
    }
}

/* ======= Load departments from API ======= */
onMounted(async () => {
    try {
        const { data } = await departmentService.getAll()
        // Kỳ vọng backend trả mảng Department: { id, name, code }
        departmentOptions.splice(
            0,
            departmentOptions.length,
            ...data.map(d => ({
                label: `${d.name} — ${d.code ?? 'N/A'}`,
                value: d.id,
                code: d.code
            }))
        )
    } catch (e) {
        // Fallback (nếu lỗi API)
        departmentOptions.splice(
            0,
            departmentOptions.length,
            { label: 'Phòng Kỹ thuật — PTK', value: 1, code: 'PTK' },
            { label: 'Phòng Kế toán — PKT', value: 2, code: 'PKT' },
            { label: 'Vận hành — VNH', value: 3, code: 'VNH' }
        )
        console.warn('Không lấy được danh sách phòng ban:', e)
    }
})

/* ======= Submit ======= */
const onSubmit = () => {
    const selectedDept = departmentOptions.find(o => o.value === form.departmentId)

    const payload = {
        incurred_date: form.incurredDate?.toISOString?.() ?? form.incurredDate,
        content: form.content?.trim(),
        department_id: form.departmentId,            // gửi ID
        department_code: selectedDept?.code ?? null, // đính kèm code nếu cần ở backend
        device_id: form.deviceId,
        device_code: form.deviceCode?.trim(),
        device_type_id: form.deviceTypeId,
        official_amount: Number(moneyParser(String(form.officialAmount || '0'))),
        invoice_no: form.invoiceNo?.trim(),
        estimated_amount: Number(moneyParser(String(form.estimatedAmount || '0'))),
        note: form.note?.trim()
    }

    console.log('SUBMIT PAYLOAD', payload)
    // TODO: gọi API tạo chi phí
    // await api.createInternalCost(payload)
}

const onFailed = (err) => {
    console.warn('VALIDATION FAILED', err)
}
</script>

<style scoped>
/* tinh gọn, để AntD lo phần lớn UI */
</style>
