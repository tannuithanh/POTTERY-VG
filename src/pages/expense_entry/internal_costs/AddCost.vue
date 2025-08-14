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

            <!-- Hàng 4: Chi phí phát sinh -->
            <a-row :gutter="16">
                <a-col :xs="24" :md="6">
                    <a-form-item label="Có hóa đơn" name="hasInvoice">
                        <a-switch v-model:checked="form.hasInvoice" checked-children="Có" un-checked-children="Không" />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="9">
                    <a-form-item label="Chi phí chính thức (VNĐ)" name="officialAmount"
                        :validate-status="!form.hasInvoice && form.officialAmount ? 'warning' : undefined"
                        :help="!form.hasInvoice && form.officialAmount ? 'Đang nhập chi phí chính thức nhưng chọn Không có hóa đơn' : ''">
                        <a-input-number v-model:value="form.officialAmount" :disabled="!form.hasInvoice"
                            :formatter="moneyFormatter" :parser="moneyParser" :min="0" style="width: 100%"
                            placeholder="Giá trị theo hóa đơn (chưa VAT)" />
                    </a-form-item>
                </a-col>

                <a-col :xs="24" :md="9">
                    <a-form-item label="Số hóa đơn" name="invoiceNo">
                        <a-input v-model:value="form.invoiceNo" :disabled="!form.hasInvoice"
                            placeholder="Nhập số hóa đơn" allow-clear />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                    <a-form-item label="Chi phí khái toán/ấn (VNĐ)" name="estimatedAmount"
                        tooltip="Giá trị theo công thức/thực tế nếu chưa có hóa đơn">
                        <a-input-number v-model:value="form.estimatedAmount" :formatter="moneyFormatter"
                            :parser="moneyParser" :min="0" style="width: 100%"
                            placeholder="Nhập chi phí khái toán/ấn" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                    <a-form-item label="File đính kèm (nếu có)" name="attachments">
                        <a-upload v-model:file-list="form.attachments" :before-upload="() => false" multiple>
                            <a-button>Chọn file</a-button>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Actions -->
            <div style="display:flex; gap: 8px; justify-content: flex-end;">
                <a-button @click="onReset">Xóa trắng</a-button>
                <a-button type="primary" html-type="submit">Lưu chi phí</a-button>
            </div>
        </a-form>
    </a-card>
</template>

<script setup>
import { reactive, computed } from 'vue'
import dayjs from 'dayjs'

/* ======= Mock options (đổi sang fetch API khi có) ======= */
const departmentOptions = [
    { label: 'Phòng Kỹ thuật', value: 'dept_tech' },
    { label: 'Phòng Kế toán', value: 'dept_acc' },
    { label: 'Vận hành', value: 'dept_ops' },
]

const deviceTypeOptions = [
    { label: 'Máy chủ', value: 'type_server' },
    { label: 'Thiết bị mạng', value: 'type_network' },
    { label: 'Thiết bị văn phòng', value: 'type_office' },
]

const deviceOptions = [
    { label: 'Server A', value: 'dev001', code: 'SRV-A-001', typeId: 'type_server' },
    { label: 'Router Core', value: 'dev002', code: 'RTR-CORE-01', typeId: 'type_network' },
    { label: 'Máy in tầng 5', value: 'dev003', code: 'PRN-05-03', typeId: 'type_office' },
]

/* ======= Form state ======= */
const form = reactive({
    incurredDate: dayjs(),     // Ngày phát sinh
    content: '',               // Nội dung chi phí
    departmentId: undefined,   // Bộ phận phân bổ
    deviceId: undefined,       // Tên thiết bị (id)
    deviceCode: '',            // Mã số thiết bị
    deviceTypeId: undefined,   // Loại thiết bị
    hasInvoice: false,         // Có hóa đơn?
    officialAmount: null,      // Chi phí chính thức (hóa đơn)
    invoiceNo: '',             // Số hóa đơn
    estimatedAmount: null,     // Chi phí khái toán/ấn
    note: '',                  // Ghi chú
    attachments: [],           // File đính kèm (Upload fileList)
})

/* ======= Validate rules ======= */
const rules = {
    incurredDate: [{ required: true, message: 'Chọn ngày phát sinh' }],
    content: [{ required: true, message: 'Nhập nội dung chi phí' }],
    departmentId: [{ required: true, message: 'Chọn bộ phận phân bổ' }],
    deviceId: [{ required: true, message: 'Chọn thiết bị' }],
    deviceCode: [{ required: true, message: 'Nhập mã số thiết bị' }],
    deviceTypeId: [{ required: true, message: 'Chọn loại thiết bị' }],
    // Khi có hóa đơn thì officialAmount + invoiceNo nên required
    officialAmount: [
        {
            validator: (_, v) =>
                form.hasInvoice && (!v || Number(v) <= 0)
                    ? Promise.reject('Nhập chi phí chính thức (VNĐ)')
                    : Promise.resolve(),
        },
    ],
    invoiceNo: [
        {
            validator: (_, v) =>
                form.hasInvoice && !v ? Promise.reject('Nhập số hóa đơn') : Promise.resolve(),
        },
    ],
    // estimatedAmount: có thể để optional; nếu muốn bắt buộc khi không có hóa đơn:
    estimatedAmount: [
        {
            validator: (_, v) =>
                !form.hasInvoice && (!v || Number(v) <= 0)
                    ? Promise.reject('Nhập chi phí khái toán/ấn (khi không có hóa đơn)')
                    : Promise.resolve(),
        },
    ],
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
        // Auto fill mã & loại khi chọn thiết bị
        form.deviceCode = found.code
        form.deviceTypeId = found.typeId
    }
}

/* ======= Submit / Reset ======= */
const onSubmit = () => {
    // Chuẩn hóa payload gửi API
    const payload = {
        incurred_date: form.incurredDate?.toISOString?.() ?? form.incurredDate,
        content: form.content?.trim(),
        department_id: form.departmentId,
        device_id: form.deviceId,
        device_code: form.deviceCode?.trim(),
        device_type_id: form.deviceTypeId,
        has_invoice: form.hasInvoice,
        official_amount: form.hasInvoice ? Number(moneyParser(String(form.officialAmount || '0'))) : null,
        invoice_no: form.hasInvoice ? form.invoiceNo?.trim() : null,
        estimated_amount: !form.hasInvoice ? Number(moneyParser(String(form.estimatedAmount || '0'))) : Number(moneyParser(String(form.estimatedAmount || '0'))),
        note: form.note?.trim(),
        // Files: giữ tạm fileList, backend cần formdata để upload
        attachments: form.attachments.map(f => ({ name: f.name, uid: f.uid })),
    }

    console.log('SUBMIT PAYLOAD', payload)
    // TODO: call API create cost
    // await api.createInternalCost(payload)
}

const onFailed = (err) => {
    console.warn('VALIDATION FAILED', err)
}

const onReset = () => {
    Object.assign(form, {
        incurredDate: null,
        content: '',
        departmentId: undefined,
        deviceId: undefined,
        deviceCode: '',
        deviceTypeId: undefined,
        hasInvoice: false,
        officialAmount: null,
        invoiceNo: '',
        estimatedAmount: null,
        note: '',
        attachments: [],
    })
}
</script>

<style scoped>
/* tinh gọn, để AntD lo phần lớn UI */
</style>
