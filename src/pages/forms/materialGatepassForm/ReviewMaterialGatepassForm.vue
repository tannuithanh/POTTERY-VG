<template>
    <a-modal :visible="visible" :destroyOnClose="true" :getContainer="false" :footer="null" :width="900"
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
                            <h1 style="margin:0;font-weight:bold; text-transform: uppercase;">
                                PHIẾU MANG TSCĐ, CCDC, HÀNG HÓA, VẬT TƯ RA CỔNG
                            </h1>
                        </td>
                        <td class="meta-cell">
                            <div><strong>Mã số:</strong> {{ meta.formCode || 'HCNS-QT40-BM01' }}</div>
                            <div><strong>Lần BH:</strong> {{ meta.revision || '02' }}</div>
                            <div><strong>Ngày BH:</strong> {{ '20/5/2025' }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- DÒNG NGÀY BÊN PHẢI -->
            <div class="row right mt8">
                <span>Núi Thành, ngày {{ today.d }} tháng {{ today.m }} năm {{ today.y }}</span>
            </div>

            <!-- THÂN PHIẾU -->
            <div class="dot-row">
                <label>Người đề nghị:</label>
                <span class="dots">{{ data.fullName }}</span>
                <label class="ml16">Bộ phận:</label>
                <span class="dots">{{ data.department }}</span>
                <label class="ml16">Chức vụ:</label>
                <span class="dots">{{ data.position }}</span>
            </div>

            <div class="dot-row">
                <label>Người mang ra cổng:</label>
                <span class="dots">{{ carrierName }}</span>
            </div>

            <div class="dot-row">
                <label>Ngày:</label>
                <span class="dots">{{ docDateOnly }}</span>
                <label class="ml16">Biển số xe:</label>
                <span class="dots">{{ data.vehiclePlate || '' }}</span>
            </div>

            <div class="dot-row">
                <label>Tên hàng hóa, vật tư:</label>
                <span class="dots">{{ data.itemName }}</span>
                <label class="ml16">Số lượng:</label>
                <span class="dots">{{ data.quantity }}</span>
            </div>

            <div class="dot-row">
                <label>Lý do:</label>
                <span class="dots">{{ data.reason }}</span>
            </div>

            <!-- ========== CHỮ KÝ ========== -->

            <!-- scrap => 2 ô -->
            <table class="signatures-table" v-if="isScrap">
                <tbody>
                    <tr>
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ approverName }}</div>
                        </td>
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ data.fullName }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- goods => 3 ô -->
            <table class="signatures-table cols-3" v-else-if="isGoods">
                <tbody>
                    <tr>
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">&nbsp;</div>
                        </td>
                        
                        <td class="center">
                            <strong>Trưởng bộ phận</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ approverName }}</div>
                        </td>
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ data.fullName }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- còn lại (mọi loại khác) => 4 ô -->
            <table class="signatures-table" v-else>
                <tbody>
                    <tr>
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">&nbsp;</div>
                        </td>
                        <td class="center">
                            <strong>Hành chính nhân sự</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">&nbsp;</div>
                        </td>
                        <td class="center">
                            <strong>Quản đốc/TBP</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ approverName }}</div>
                        </td>
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="sign-note">(Ký, ghi tên)</div>
                            <div class="signature">{{ data.fullName }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="actions no-print">
                <a-button type="primary" :loading="loading" @click="handleSubmit">Hoàn thành</a-button>
                <a-button danger :disabled="loading" @click="close">Huỷ bỏ</a-button>
            </div>
        </div>
    </a-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { formInstanceService } from '@/services/form_service/formInstanceService'

const userAuth = useAuthStore()

const props = defineProps({
    visible: { type: Boolean, default: false },
    data: { type: Object, default: () => ({}) },
    users: { type: Array, default: () => [] },
    approverId: { type: [String, Number], default: null },
    meta: { type: Object, default: () => ({ formCode: '', revision: '', revisionDate: '' }) }
})

const emit = defineEmits(['update:visible', 'success'])
const loading = ref(false)
const close = () => emit('update:visible', false)

/* ===== Chuẩn hoá loại phiếu: scrap | goods | other (mặc định) ===== */
const normalize = (s) => (s ?? '').toString().trim().toLowerCase()
const trueish = (v) => v === true || v === 1 || v === '1' || (typeof v === 'string' && v.toLowerCase() === 'true')

const typeResolved = computed(() => {
    const d = props.data || {}
    const raw = normalize(d.gatepassType ?? d.gatepass_type)
    if (raw === 'scrap') return 'scrap'
    if (raw === 'goods') return 'goods'
    // fallback di sản: nếu có cờ phế liệu cũ thì coi là scrap, ngược lại gom về "other" => 4 ô
    const flag = d.isScrapLiquidation ?? d.is_scrap_liquidation
    return trueish(flag) ? 'scrap' : 'other'
})

const isScrap = computed(() => typeResolved.value === 'scrap')
const isGoods = computed(() => typeResolved.value === 'goods')
// còn lại auto rơi vào nhánh v-else => 4 ô

/* ===== Hiển thị ===== */
const today = computed(() => {
    const now = new Date()
    return {
        d: String(now.getDate()).padStart(2, '0'),
        m: String(now.getMonth() + 1).padStart(2, '0'),
        y: now.getFullYear()
    }
})
const carrierName = computed(() => (props.data?.carrierName || '').trim())
const docDateOnly = computed(() =>
    props.data?.docDate ? dayjs(props.data.docDate).format('DD/MM/YYYY') : ''
)
const findNameById = (id) => props.users?.find(u => String(u.id) === String(id))?.name || ''
const approverName = computed(() => findNameById(props.data?.approverId ?? props.approverId))

/* ===== Submit API ===== */
const handleSubmit = async () => {
    try {
        loading.value = true

        const requesterId = userAuth.user?.id || null
        if (!requesterId) throw new Error('Thiếu thông tin người đề nghị')

        if (!props.data?.docDate) throw new Error('Thiếu Ngày phiếu')
        if (!carrierName.value) throw new Error('Thiếu Người mang ra cổng')
        if (!props.data?.vehiclePlate) throw new Error('Thiếu Biển số xe')
        if (!props.data?.itemName) throw new Error('Thiếu Tên hàng hóa, vật tư')
        if (!props.data?.quantity) throw new Error('Thiếu Số lượng')
        if (!props.data?.reason) throw new Error('Thiếu Lý do')
        if (!(props.data?.approverId ?? props.approverId)) throw new Error('Thiếu Người ký duyệt')

        const payload = {
            doc_date: dayjs(props.data.docDate).format('YYYY-MM-DD'),
            requester_id: requesterId,
            carrier_name: carrierName.value,
            vehicle_plate: props.data.vehiclePlate,
            item_name: props.data.itemName,
            quantity: Number(props.data.quantity),
            reason: props.data.reason,
            approver_id: props.data.approverId ?? props.approverId,
            is_scrap_liquidation: typeResolved.value === 'scrap',
            gatepass_type: typeResolved.value   // => 'scrap' | 'goods' | 'other'
        }

        await formInstanceService.createMaterialGatepass(payload)

        notification.success({
            message: 'Thành công',
            description: 'Đã tạo phiếu mang vật tư ra cổng.',
            placement: 'topRight'
        })

        emit('success')
        emit('update:visible', false)
    } catch (err) {
        const desc = err?.response?.data?.message || err?.message || 'Không thể tạo phiếu, vui lòng kiểm tra lại'
        notification.error({
            message: 'Lỗi tạo phiếu',
            description: desc,
            placement: 'topRight',
            duration: 4.5
        })
    } finally {
        loading.value = false
    }
}
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

.sign-note {
    margin-top: 4px;
    font-style: italic
}

.signature {
    margin-top: 100px;
    font-weight: 600
}

.actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 12px
}
</style>
