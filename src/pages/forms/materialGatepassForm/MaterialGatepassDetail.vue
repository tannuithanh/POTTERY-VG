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
                <span>Ngày {{ headerDate.d }} tháng {{ headerDate.m }} năm {{ headerDate.y }}</span>
            </div>

            <!-- THÂN PHIẾU -->
            <div class="dot-row">
                <label>Người đề nghị:</label>
                <span class="dots">{{ submitterName }}</span>
                <label class="ml16">Bộ phận:</label>
                <span class="dots">{{ submitterDept }}</span>
                <label class="ml16">Chức vụ:</label>
                <span class="dots">{{ submitterPos }}</span>
            </div>

            <div class="dot-row">
                <label>Người mang ra cổng:</label>
                <span class="dots">{{ data.carrier_name || '' }}</span>
            </div>

            <div class="dot-row">
                <label>Ngày:</label>
                <span class="dots">{{ docDateOnly }}</span>
                <label class="ml16">Biển số xe:</label>
                <span class="dots">{{ data.vehicle_plate || '' }}</span>
            </div>

            <div class="dot-row">
                <label>Tên hàng hóa, vật tư:</label>
                <span class="dots">{{ data.item_name || '' }}</span>
                <label class="ml16">Số lượng:</label>
                <span class="dots">{{ data.quantity ?? '' }}</span>
            </div>

            <div class="dot-row">
                <label>Lý do:</label>
                <span class="dots">{{ data.reason || '' }}</span>
            </div>

            <!-- ========== BẢNG KÝ DUYỆT ========== -->

            <!-- 1) PHẾ LIỆU: 2 ô — Phê duyệt (B3) | Người đề nghị -->
            <table class="signatures-table" v-if="isScrap">
                <tbody>
                    <tr>
                        <!-- Phê duyệt (B3 - cuối) -->
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <template v-if="canApproveStep3">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(3)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(3)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step3View).img">
                                        <img :src="stampFor(step3View).img" :alt="stampFor(step3View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step3View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step3View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>

                        <!-- Người đề nghị -->
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="signature">
                                <template v-if="submitterSignature.url">
                                    <img :src="submitterSignature.url" alt="Chữ ký người đề nghị"
                                        class="signature-image" />
                                </template>
                                <template v-else>
                                    <img :src="acceptImg" alt="Chưa ký" class="signature-image" />
                                </template>
                                <div class="signature-name">{{ submitterName }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 2) HÀNG HÓA: 3 ô — Người đề nghị | Trưởng bộ phận (B2) | Phê duyệt (B3) -->
            <table class="signatures-table cols-3" v-else-if="isGoods">
                <tbody>
                    <tr>
                        <!-- Phê duyệt (B3) -->
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <template v-if="canApproveStep3">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(3)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(3)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step3View).img">
                                        <img :src="stampFor(step3View).img" :alt="stampFor(step3View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step3View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step3View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>
                        <!-- Trưởng bộ phận (B2) -->
                        <td class="center">
                            <strong>Trưởng bộ phận</strong>
                            <template v-if="canApproveStep2">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <template v-if="needNextApprover">
                                        <a-select v-model:value="nextApproverId" :options="approverOptions"
                                            :loading="loadingApprovers" placeholder="Chọn người duyệt kế tiếp"
                                            style="width:100%;" show-search :filter-option="filterOnlyByName"
                                            optionFilterProp="label" :allow-clear="true" />
                                        <div v-if="showNextApproverError"
                                            style="color:#ff4d4f; font-size:12px; margin-top:4px;">
                                            Vui lòng chọn người duyệt kế tiếp.
                                        </div>
                                    </template>
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(2)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(2)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step2View).img">
                                        <img :src="stampFor(step2View).img" :alt="stampFor(step2View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step2View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step2View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>
                        <!-- Người đề nghị -->
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="signature">
                                <template v-if="submitterSignature?.url">
                                    <img :src="submitterSignature.url" alt="Chữ ký người đề nghị"
                                        class="signature-image" />
                                </template>
                                <template v-else>
                                    <img :src="acceptImg" alt="Chưa ký" class="signature-image" />
                                </template>
                                <div class="signature-name">{{ submitterName }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 3) MẶC ĐỊNH: 4 ô — Phê duyệt (B3) | GĐX/HCNS (B2) | Quản đốc (B1) | Người đề nghị -->
            <table class="signatures-table" v-else>
                <tbody>
                    <tr>
                        <!-- Phê duyệt (B3) -->
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <template v-if="canApproveStep3">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <template v-if="needNextApprover">
                                        <a-select v-model:value="nextApproverId" :options="approverOptions"
                                            :loading="loadingApprovers" placeholder="Chọn người duyệt kế tiếp"
                                            style="width:100%;" show-search :filter-option="filterOnlyByName"
                                            optionFilterProp="label" :allow-clear="true" />
                                        <div v-if="showNextApproverError"
                                            style="color:#ff4d4f; font-size:12px; margin-top:4px;">
                                            Vui lòng chọn người duyệt kế tiếp.
                                        </div>
                                    </template>
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(3)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(3)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step3View).img">
                                        <img :src="stampFor(step3View).img" :alt="stampFor(step3View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step3View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step3View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>

                        <!-- GĐX/HCNS (B2) -->
                        <td class="center">
                            <strong>GĐX/ HCNS</strong>
                            <template v-if="canApproveStep2">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <template v-if="needNextApprover">
                                        <a-select v-model:value="nextApproverId" :options="approverOptions"
                                            :loading="loadingApprovers" placeholder="Chọn người duyệt kế tiếp"
                                            style="width:100%;" show-search :filter-option="filterOnlyByName"
                                            optionFilterProp="label" :allow-clear="true" />
                                        <div v-if="showNextApproverError"
                                            style="color:#ff4d4f; font-size:12px; margin-top:4px;">
                                            Vui lòng chọn người duyệt kế tiếp.
                                        </div>
                                    </template>
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(2)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(2)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step2View).img">
                                        <img :src="stampFor(step2View).img" :alt="stampFor(step2View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step2View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step2View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>

                        <!-- Quản đốc (B1) -->
                        <td class="center">
                            <strong>Quản đốc/TBP</strong>
                            <template v-if="canApproveStep1">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <template v-if="needNextApprover">
                                        <a-select v-model:value="nextApproverId" :options="approverOptions"
                                            :loading="loadingApprovers" placeholder="Chọn người duyệt kế tiếp"
                                            style="width:100%;" show-search :filter-option="filterOnlyByName"
                                            optionFilterProp="label" :allow-clear="true" />
                                        <div v-if="showNextApproverError"
                                            style="color:#ff4d4f; font-size:12px; margin-top:4px;">
                                            Vui lòng chọn người duyệt kế tiếp.
                                        </div>
                                    </template>
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving"
                                            @click="actions.approveStep(1)">Đồng ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep(1)">Từ
                                            chối</a-button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="signature">
                                    <template v-if="stampFor(step1View).img">
                                        <img :src="stampFor(step1View).img" :alt="stampFor(step1View).alt"
                                            class="signature-image" />
                                    </template>
                                    <template v-else>
                                        <div class="no-signature">{{ stateText(step1View.state) }}</div>
                                    </template>
                                    <div class="signature-name">{{ step1View.name || '—' }}</div>
                                </div>
                            </template>
                        </td>

                        <!-- Người đề nghị -->
                        <td class="center">
                            <strong>Người đề nghị</strong>
                            <div class="signature">
                                <template v-if="submitterSignature?.url">
                                    <img :src="submitterSignature.url" alt="Chữ ký người đề nghị"
                                        class="signature-image" />
                                </template>
                                <template v-else>
                                    <img :src="acceptImg" alt="Chưa ký" class="signature-image" />
                                </template>
                                <div class="signature-name">{{ submitterName }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- /BẢNG KÝ DUYỆT -->
        </div>
    </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { notification, message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { formApprovalService } from '@/services/form_service/formApprovalService'
import userService from '@/services/userService'
import { resolveStoragePath } from '@/utils/storage'

import acceptImg from '@/assets/images/accept.png'
import rejectImg from '@/assets/images/reject.png'

/* PROPS / EMITS */
const props = defineProps({
    visible: Boolean,
    formInstance: { type: Object, required: true },
    meta: { type: Object, default: () => ({ formCode: '', revision: '', revisionDate: '' }) },
})
const emit = defineEmits(['close', 'updated'])
const close = () => emit('close')

/* DATA */
const data = computed(() => props.formInstance?.data || {})

const submitterName = computed(() =>
    props.formInstance?.submitter_info?.name || props.formInstance?.submitter_name || ''
)
const submitterDept = computed(() =>
    props.formInstance?.submitter_info?.department?.name || props.formInstance?.department_name || ''
)
const submitterPos = computed(() =>
    props.formInstance?.submitter_info?.position?.name || props.formInstance?.position_name || ''
)

const headerDate = computed(() => {
    const src = data.value?.doc_date || props.formInstance?.created_at || new Date()
    const d = dayjs(src)
    return { d: d.format('DD'), m: d.format('MM'), y: d.format('YYYY') }
})
const docDateOnly = computed(() =>
    data.value?.doc_date ? dayjs(data.value.doc_date).format('DD/MM/YYYY') : ''
)

/* ===== NHẬN DIỆN LAYOUT (scrap2 / goods3 / other4) ===== */
const trueish = v => v === true || v === 1 || v === '1' || (typeof v === 'string' && v.toLowerCase() === 'true')

const layoutType = computed(() => {
    const d = data.value || {}

    // ưu tiên signature_layout nếu có
    const layout = (d.signature_layout ?? d.signatureLayout ?? '').toString().toLowerCase()
    if (layout === 'scrap2') return 'scrap'
    if (layout === 'goods3') return 'goods'
    if (layout === 'other4') return 'other'

    // kế đến gatepass_type
    const t = (d.gatepass_type ?? d.gatepassType ?? '').toString().toLowerCase()
    if (t === 'scrap') return 'scrap'
    if (t === 'goods') return 'goods'
    if (t) return 'other' // pottery/other → other4

    // fallback cờ cũ
    return trueish(d.is_scrap_liquidation ?? d.isScrapLiquidation) ? 'scrap' : 'goods'
})

const isScrap = computed(() => layoutType.value === 'scrap')
const isGoods = computed(() => layoutType.value === 'goods')
// other => mặc định vào nhánh 4 ô trong template

/* STEPS / SIGNATURES */
const steps = computed(() => props.formInstance?.steps || [])
const getStep = (n) => steps.value.find(s => s.step === n)
const sigUrl = (raw) => (raw ? resolveStoragePath(raw) : '')

const viewOf = (n) => {
    const s = getStep(n)
    if (!s) return { url: '', name: '', state: 'pending', id: null, approverId: null, stepNo: n, hasSig: false }
    const sig = s?.approver_info?.signature ? sigUrl(s.approver_info.signature) : ''
    return {
        url: s.status === 'approved' && sig ? sig : '',
        name: s?.approver_info?.name || '',
        state: s.status || 'pending',
        id: s.id,
        approverId: s.approver_id,
        stepNo: s.step,
        hasSig: !!sig,
    }
}

const step1View = computed(() => viewOf(1)) // Quản đốc (layout 4 ô)
const step2View = computed(() => viewOf(2)) // TBP (goods3) / GĐX-HCNS (other4)
const step3View = computed(() => viewOf(3)) // Phê duyệt (cuối)
const submitterSignature = computed(() => ({ url: sigUrl(props.formInstance?.submitter_info?.signature) }))

const stampFor = (sv) => {
    if (sv.state === 'rejected') return { img: rejectImg, alt: 'Đã từ chối' }
    if (sv.state === 'approved') {
        if (sv.hasSig && sv.url) return { img: sv.url, alt: 'Chữ ký' }
        return { img: acceptImg, alt: 'Đã duyệt' }
    }
    return { img: '', alt: '' }
}

/* QUYỀN DUYỆT */
const auth = useAuthStore()
const currentUserId = computed(() => auth.user?.id)
const currentStepNo = computed(() => props.formInstance?.current_step)
const canApproveFor = (v) =>
    !!(v && v.state === 'pending' && v.stepNo === currentStepNo.value && v.approverId === currentUserId.value)

const canApproveStep1 = computed(() => canApproveFor(step1View.value))
const canApproveStep2 = computed(() => canApproveFor(step2View.value))
const canApproveStep3 = computed(() => canApproveFor(step3View.value))
const stateText = (st) => (st === 'approved' ? 'Đã ký' : st === 'rejected' ? 'Đã từ chối' : 'Chưa ký')

/* NEXT APPROVER */
const totalSteps = computed(() => Number(props.formInstance?.form?.steps_count) || 3)
const needNextApprover = computed(() => (currentStepNo.value || 0) < totalSteps.value)

const approverOptions = ref([])
const loadingApprovers = ref(false)
const nextApproverId = ref(null)
const showNextApproverError = ref(false)

const normalize = (s) =>
    (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const filterOnlyByName = (input, option) => normalize(option?.label).includes(normalize(input))

function normalizeUsersResponse(res) {
    const raw = res?.data ?? res
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.items)) return raw.items
    if (Array.isArray(raw?.results)) return raw.results
    if (Array.isArray(raw?.data)) return raw.data
    return []
}

async function loadApprovers() {
    try {
        loadingApprovers.value = true
        const res = await userService.getAll()
        const list = normalizeUsersResponse(res)
        approverOptions.value = list.map(u => ({ value: u.id, label: u.name || u.full_name || u.username || '' }))
    } finally {
        loadingApprovers.value = false
    }
}

watch(
    () => [props.visible, currentStepNo.value, needNextApprover.value],
    ([v]) => {
        if (v && needNextApprover.value) {
            nextApproverId.value = null
            showNextApproverError.value = false
            loadApprovers()
        }
    },
    { immediate: true }
)

/* ACTIONS */
const approving = ref(false)
const rejecting = ref(false)

async function doApprove(stepId) {
    try {
        if (needNextApprover.value && !nextApproverId.value) {
            showNextApproverError.value = true
            message.warning('Vui lòng chọn người duyệt kế tiếp.')
            return
        }
        approving.value = true
        const payload = needNextApprover.value ? { next_approver_id: nextApproverId.value } : {}
        await formApprovalService.approveMaterialGatepass(stepId, payload)
        notification.success({ message: 'Phê duyệt thành công', description: 'Phiếu đã được cập nhật.' })
        emit('updated')
        emit('close')
    } catch (err) {
        notification.error({
            message: 'Lỗi khi duyệt',
            description: err?.response?.data?.message || err?.message || 'Đã có lỗi xảy ra.'
        })
    } finally {
        approving.value = false
    }
}

async function doReject(stepId) {
    try {
        rejecting.value = true
        await formApprovalService.rejectMaterialGatepass(stepId, {})
        notification.success({ message: 'Từ chối thành công', description: 'Phiếu đã bị từ chối.' })
        emit('updated')
        emit('close')
    } catch (err) {
        notification.error({
            message: 'Lỗi khi từ chối',
            description: err?.response?.data?.message || err?.message || 'Đã có lỗi xảy ra.'
        })
    } finally {
        rejecting.value = false
    }
}

const stepViewByNo = (n) => (n === 1 ? step1View.value : n === 2 ? step2View.value : step3View.value)
const actions = {
    approveStep: (n) => {
        const v = stepViewByNo(n)
        if (v.id) doApprove(v.id)
    },
    rejectStep: (n) => {
        const v = stepViewByNo(n)
        if (v.id) doReject(v.id)
    },
}
</script>


<style scoped>
/* 4 ô chữ ký chia đều, không vỡ hàng */
.signatures-table td {
    width: 25%;
}

/* Dòng chấm không bị tụt, không wrap lung tung */
.dot-row .dots {
    flex: 1 1 0;
    min-width: 0;
    /* cho phép co mà không tràn */
    white-space: nowrap;
    /* muốn xuống dòng thì đổi thành pre-wrap */
    overflow: hidden;
}

/* Ảnh chữ ký không nhòe/vỡ */
.signature-image {
    max-width: 100%;
    height: 100px;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
}

.signature-image {
    height: 100px;
    object-fit: contain;
    margin-bottom: 4px;
}

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

.signature {
    font-weight: 600
}

.no-signature {
    font-size: 12px;
    color: #888;
    font-style: italic;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center
}

.signature-name {
    margin-top: 6px;
}
</style>
