<template>
    <a-modal :visible="props.visible" :footer="null" :width="900"
        wrap-class-name="force-fixed-width-modal no-padding-modal" :mask-closable="true" :keyboard="true"
        :closable="false" @cancel="close">
        <div class="print-area">
            <!-- HEADER -->
            <table class="form-header">
                <tbody>
                    <tr>
                        <td class="logo-cell center">
                            <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
                        </td>
                        <td class="title-cell center">
                            <h1 style="margin:0;font-weight:bold;">PHIẾU ĐỀ NGHỊ ĐIỀU ĐỘNG XE</h1>
                        </td>
                        <td class="meta-cell">
                            <div><strong>Mã số:</strong> {{ meta.formCode || 'HCNS-QT09-BM05' }}</div>
                            <div><strong>Lần BH:</strong> {{ meta.revision || '03' }}</div>
                            <div><strong>Ngày BH:</strong> {{ meta.revisionDate || '14/05/2025' }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- DÒNG NGÀY BÊN PHẢI -->
            <div class="row right mt8">
                <span>Ngày {{ today.d }} tháng {{ today.m }} năm {{ today.y }}</span>
            </div>

            <!-- THÂN PHIẾU -->
            <div class="dot-row">
                <label>Người đề nghị:</label>
                <span class="dots">{{ data.fullName }}</span>
                <label class="ml16">Bộ phận:</label>
                <span class="dots">{{ data.department }}</span>
            </div>

            <div class="dot-row">
                <label>Đề nghị BP. HCNS điều động xe ô tô:</label>
                <span class="dots">{{ data.carText }}</span>
                <label class="ml16">Tài xế:</label>
                <span class="dots">{{ data.driverText }}</span>
            </div>

            <!-- CHỈ GIỜ Ở "TỪ", NGÀY RIÊNG -->
            <div class="dot-row">
                <label>Thời gian sử dụng xe:</label>
                <span class="dots">{{ data.carText }}</span>
                <label class="ml16">từ</label>
                <span class="dots">{{ fromTimeOnly }}</span>
                <label class="ml16">Ngày</label>
                <span class="dots">{{ dateOnly }}</span>
            </div>

            <div class="dot-row">
                <label>Lộ trình Từ</label>
                <span class="dots">{{ data.routeFrom }}</span>
                <label class="ml16">đến</label>
                <span class="dots">{{ data.routeTo }}</span>
            </div>

            <div class="dot-row">
                <label>Lý do sử dụng xe</label>
                <span class="dots">{{ data.reason }}</span>
            </div>

            <!-- 4 Ô KÝ DUYỆT -->
            <table v-if="isHCNS" class="signatures-table two-cols">
                <tbody>
                    <tr>
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">{{ managerName }}</div>
                        </td>
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">{{ data.fullName }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Các phòng ban khác -> giữ nguyên 4 ô -->
            <table v-else class="signatures-table">
                <tbody>
                    <tr>
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">&nbsp;</div>
                        </td>

                        <td class="center">
                            <strong>Nhân viên HCNS</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">&nbsp;</div>
                        </td>

                        <td class="center">
                            <strong>Trưởng bộ phận</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">{{ managerName }}</div>
                        </td>

                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="sign-note">(Ký, họ tên)</div>
                            <div class="signature">{{ data.fullName }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="note">Chú ý: Phiếu này được chuyển đến BP. HCNS trước 24h</div>

            <div class="actions no-print">
                <a-button type="primary" @click="handleSubmit">Hoàn thành</a-button>
                <a-button danger @click="close">Huỷ bỏ</a-button>
            </div>
        </div>
    </a-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import { useAuthStore } from '@/stores/auth'
const userAuth = useAuthStore()
const props = defineProps({
    visible: Boolean,
    data: { type: Object, default: () => ({}) },
    managers: { type: Array, default: () => [] },
    users: { type: Array, default: () => [] },
    managerId: { type: [String, Number], default: null },
    meta: { type: Object, default: () => ({ formCode: '', revision: '', revisionDate: '' }) }
})
const departmentId = computed(() =>
  props.data?.departmentId ?? userAuth.user?.department?.id ?? null
)

// ✅ HCNS = 23 -> chỉ 2 ô ký
const isHCNS = computed(() => String(departmentId.value) === '23')
const emit = defineEmits(['update:visible', 'submit', 'success']) // 'success' optional

const loading = ref(false)

const close = () => emit('update:visible', false)

/** CLICK HOÀN THÀNH -> GỌI API */
const handleSubmit = async () => {
    try {
        loading.value = true

        const payload = {
            created_at: dayjs().format('YYYY-MM-DD'),
            requester_id: userAuth.user?.id || null,
            department_id: departmentId.value,                    // ✅ gửi department_id
            vehicle: props.data?.carText || '',
            driver: props.data?.driverText || '',
            start_time: props.data?.fromDate ? dayjs(props.data.fromDate).format('YYYY-MM-DD HH:mm:ss') : '',
            end_time: props.data?.toDate ? dayjs(props.data.toDate).format('YYYY-MM-DD HH:mm:ss') : '',
            route_from: props.data?.routeFrom || '',
            route_to: props.data?.routeTo || '',
            reason: props.data?.reason || '',
            manager_id: props.data?.approverId ?? props.managerId // người phê duyệt duy nhất
        }
        // validate nhanh phía client (cực gọn, đúng những gì backend yêu cầu)
        if (!payload.requester_id) throw new Error('Thiếu requester_id')
        if (!payload.vehicle) throw new Error('Thiếu xe ô tô')
        if (!payload.driver) throw new Error('Thiếu tài xế')
        if (!payload.start_time || !payload.end_time) throw new Error('Thiếu thời gian bắt đầu/kết thúc')
        if (!payload.route_from || !payload.route_to) throw new Error('Thiếu lộ trình từ/đến')
        if (!payload.reason) throw new Error('Thiếu lý do sử dụng xe')
        if (!payload.manager_id) throw new Error('Thiếu người duyệt bước 1 (manager_id)')

        // GỌI API tạo phiếu Điều động xe
        await formInstanceService.createVehicleDispatch(payload)

        message.success('Tạo phiếu điều động xe thành công')
        emit('success') // optional cho parent bắt sự kiện refresh list
        emit('update:visible', false)
    } catch (err) {
        console.error(err)
        message.error(err?.message || 'Không thể tạo phiếu, vui lòng kiểm tra lại')
    } finally {
        loading.value = false
    }
}

const today = computed(() => {
    const now = new Date()
    return {
        d: String(now.getDate()).padStart(2, '0'),
        m: String(now.getMonth() + 1).padStart(2, '0'),
        y: now.getFullYear()
    }
})

/* chỉ giờ ở "từ" + ngày riêng (phần hiển thị) */
const fromTimeOnly = computed(() =>
    props.data?.fromDate ? dayjs(props.data.fromDate).format('HH:mm') : ''
)
const dateOnly = computed(() => {
    const d = props.data?.toDate || props.data?.fromDate
    return d ? dayjs(d).format('DD/MM/YYYY') : ''
})

/* Lấy tên trưởng bộ phận từ id truyền lên (phần hiển thị) */
const findName = (list, id) => list?.find(u => u.id === id)?.name || ''
const managerName = computed(() =>
    findName(props.users?.length ? props.users : props.managers, props.data?.approverId ?? props.managerId)
)
</script>


<style scoped>


.print-area {
    font-family: Tahoma, Arial, sans-serif;
    background: #fff;
    padding: 16px 24px 24px;
    min-width: 820px;
    color: #000
}

.form-header {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #000
}

.logo-cell,
.title-cell,
.meta-cell {
    border: 1px solid #000;
    padding: 8px;
    vertical-align: middle
}

.center {
    text-align: center
}

.logo {
    width: 80px
}

.title-cell h1 {
    margin: 0;
    font-size: 18px;
    letter-spacing: .5px
}

.meta-cell {
    font-size: 13px;
    line-height: 1.6
}

.row {
    display: flex;
    gap: 16px;
    align-items: center
}

.right {
    justify-content: flex-end
}

.mt8 {
    margin-top: 8px
}

.dot-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 8px;
    gap: 12px;
    line-height: 1.9
}

.dot-row label {
    min-width: max-content;
    font-weight: 600
}

.ml16 {
    margin-left: 16px
}

.dots {
    flex: 1 1 auto;
    min-width: 120px;
    border-bottom: 1px dotted #000;
    padding: 0 4px 2px
}

.signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 28px
}

.signatures-table td {
    border: 1px solid #000;
    padding: 11px 8px 11px;
    vertical-align: top;
    width: 25%
}

/* 4 ô bằng nhau */
.sign-note {
    margin-top: 4px;
    font-style: italic
}

.signature {
    margin-top: 100px;
    font-weight: 600
}

.note {
    margin-top: 12px;
    font-style: italic
}

.actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 12px
}


/* HCNS: 2 cột */
.signatures-table.two-cols td {
  width: 50%;
}
</style>
