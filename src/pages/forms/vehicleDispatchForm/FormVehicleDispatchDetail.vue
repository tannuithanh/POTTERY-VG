<template>
    <a-modal :visible="visible" :footer="null" :width="900" wrap-class-name="force-fixed-width-modal no-padding-modal"
        :mask-closable="true" :keyboard="true" :closable="false" @cancel="close">
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
                <span>Ngày {{ createdAt.d }} tháng {{ createdAt.m }} năm {{ createdAt.y }}</span>
            </div>

            <!-- THÂN PHIẾU -->
            <div class="dot-row">
                <label>Người đề nghị:</label>
                <span class="dots">{{ submitterName }}</span>
                <label class="ml16">Bộ phận:</label>
                <span class="dots">{{ submitterDept }}</span>
            </div>

            <div class="dot-row">
                <label>Đề nghị BP. HCNS điều động xe ô tô:</label>
                <span class="dots">{{ data.vehicle }}</span>
                <label class="ml16">Tài xế:</label>
                <span class="dots">{{ data.driver }}</span>
            </div>

            <div class="dot-row">
                <label>Thời gian sử dụng xe:</label>
                <span class="dots">{{ fromTimeOnly }}</span>
                <label class="ml16">đến</label>
                <span class="dots">{{ toTimeOnly }}</span>
                <label class="ml16">Ngày</label>
                <span class="dots">{{ dateOnly }}</span>
            </div>

            <div class="dot-row">
                <label>Lộ trình Từ</label>
                <span class="dots">{{ data.route_from }}</span>
                <label class="ml16">đến</label>
                <span class="dots">{{ data.route_to }}</span>
            </div>

            <div class="dot-row">
                <label>Lý do sử dụng xe</label>
                <span class="dots">{{ data.reason }}</span>
            </div>

            <!-- 4 Ô KÝ DUYỆT (thứ tự như yêu cầu) -->
            <!-- CHỮ KÝ -->
            <!-- HCNS (department_id=23) -> chỉ 2 ô: Phê duyệt & Người đề nghị -->
            <table v-if="isHCNS" class="signatures-table two-cols">
                <tbody>
                    <tr>
                        <!-- Phê duyệt (bước cuối) -->
                        <td class="center">
                            <strong>Phê duyệt</strong>
                            <template v-if="canApproveStep3">
                                <div class="signature" style="gap:10px; text-align:left; width:100%;">
                                    <!-- Chế độ 2 ô: không còn bước tiếp theo => không cần chọn next approver -->
                                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                                        <a-button type="primary" :loading="approving" @click="actions.approveStep3">Đồng
                                            ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep3">Từ
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
                            <strong>NGƯỜI ĐỀ NGHỊ</strong>
                            <div class="signature">
                                <template v-if="submitterSignature.url">
                                    <img :src="submitterSignature.url" alt="Chữ ký người đề nghị"
                                        class="signature-image" />
                                </template>
                                <template v-else>
                                    <div class="no-signature">Chưa ký</div>
                                </template>
                                <div class="signature-name">{{ submitterName }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Các phòng ban khác -> giữ nguyên 4 ô như hiện tại -->
            <table v-else class="signatures-table">
                <tbody>
                    <tr>
                        <!-- Ô 4: BƯỚC 3 - Phê duyệt cuối -->
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
                                        <a-button type="primary" :loading="approving" @click="actions.approveStep3">Đồng
                                            ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep3">Từ
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

                        <!-- Ô 3: BƯỚC 2 - HCNS -->
                        <td class="center">
                            <strong>Nhân viên HCNS</strong>
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
                                        <a-button type="primary" :loading="approving" @click="actions.approveStep2">Đồng
                                            ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep2">Từ
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

                        <!-- Ô 2: BƯỚC 1 - Trưởng bộ phận -->
                        <td class="center">
                            <strong>Trưởng bộ phận</strong>
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
                                        <a-button type="primary" :loading="approving" @click="actions.approveStep1">Đồng
                                            ý</a-button>
                                        <a-button danger :loading="rejecting" @click="actions.rejectStep1">Từ
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

                        <!-- Ô 1: Người đề nghị -->
                        <td class="center">
                            <strong>NGƯỜI ĐỀ NGHỊ</strong>
                            <div class="signature">
                                <template v-if="submitterSignature.url">
                                    <img :src="submitterSignature.url" alt="Chữ ký người đề nghị"
                                        class="signature-image" />
                                </template>
                                <template v-else>
                                    <div class="no-signature">Chưa ký</div>
                                </template>
                                <div class="signature-name">{{ submitterName }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>


            <div class="note">Chú ý: Phiếu này được chuyển đến BP. HCNS trước 24h</div>
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

/* 🔴 dấu đóng & ảnh trạng thái */
import acceptImg from '@/assets/images/accept.png'
import rejectImg from '@/assets/images/reject.png'

/* PROPS / EMITS */
const props = defineProps({
    visible: Boolean,
    formInstance: { type: Object, required: true },
    meta: { type: Object, default: () => ({ formCode: '', revision: '', revisionDate: '' }) }
})
const departmentId = computed(() =>
    props.formInstance?.data?.department_id ??
    props.formInstance?.submitter_info?.department?.id ??
    null
)

// 👉 HCNS = 23 -> dùng chế độ 2 ô
const isHCNS = computed(() => String(departmentId.value) === '23')

// 👉 Tổng bước duyệt *hữu hiệu* cho logic chọn next approver
// HCNS: chỉ còn bước cuối cùng => 1 bước hiệu dụng
const totalEffectiveSteps = computed(() => isHCNS.value ? 1 : (props.formInstance?.form?.steps_count || 0))


const emit = defineEmits(['close', 'updated'])
const close = () => emit('close')

/* HIỂN THỊ CHUNG */
const data = computed(() => props.formInstance?.data || {})
const submitterName = computed(() =>
    props.formInstance?.submitter_info?.name || props.formInstance?.submitter_name || ''
)
const submitterDept = computed(() =>
    props.formInstance?.submitter_info?.department?.name || props.formInstance?.department_name || ''
)
const createdAt = computed(() => {
    const src = props.formInstance?.created_at || data.value?.created_at || new Date()
    const d = dayjs(src)
    return { d: d.format('DD'), m: d.format('MM'), y: d.format('YYYY') }
})
const fromTimeOnly = computed(() => data.value?.start_time ? dayjs(data.value.start_time).format('HH:mm') : '')
const toTimeOnly = computed(() => data.value?.end_time ? dayjs(data.value.end_time).format('HH:mm') : '')
const dateOnly = computed(() => {
    const d = data.value?.end_time || data.value?.start_time
    return d ? dayjs(d).format('DD/MM/YYYY') : ''
})

/* BƯỚC / CHỮ KÝ */
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
        hasSig: !!sig
    }
}
const step1View = computed(() => viewOf(1)) // Trưởng bộ phận
const step2View = computed(() => viewOf(2)) // HCNS
const step3View = computed(() => viewOf(3)) // Phê duyệt cuối
const submitterSignature = computed(() => ({ url: sigUrl(props.formInstance?.submitter_info?.signature) }))

/* ✅ Ảnh hiển thị cho từng step theo trạng thái */
const stampFor = (sv) => {
    // Rejected => ảnh reject
    if (sv.state === 'rejected') {
        return { img: rejectImg, alt: 'Đã từ chối' }
    }
    // Approved => nếu có chữ ký thì dùng chữ ký; không có thì ảnh accept
    if (sv.state === 'approved') {
        if (sv.hasSig && sv.url) return { img: sv.url, alt: 'Chữ ký' }
        return { img: acceptImg, alt: 'Đã duyệt' }
    }
    // Pending => không ảnh
    return { img: '', alt: '' }
}

/* QUYỀN DUYỆT */
const auth = useAuthStore()
const currentUserId = computed(() => auth.user?.id)
const currentStepNo = computed(() => props.formInstance?.current_step)
const canApproveFor = (v) => !!(v && v.state === 'pending' && v.stepNo === currentStepNo.value && v.approverId === currentUserId.value)
const canApproveStep1 = computed(() => canApproveFor(step1View.value))
const canApproveStep2 = computed(() => canApproveFor(step2View.value))
const canApproveStep3 = computed(() => canApproveFor(step3View.value))
const stateText = (st) => st === 'approved' ? 'Đã ký' : (st === 'rejected' ? 'Đã từ chối' : 'Chưa ký')

const needNextApprover = computed(() => {
    return (currentStepNo.value || 0) < totalEffectiveSteps.value
})

/* DANH SÁCH NGƯỜI DUYỆT KẾ TIẾP (lọc theo tên) */
const approverOptions = ref([])
const loadingApprovers = ref(false)
const nextApproverId = ref(null)
const showNextApproverError = ref(false)

const normalize = (s) =>
    (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const filterOnlyByName = (input, option) => normalize(option?.label).includes(normalize(input))

async function loadApprovers() {
    try {
        loadingApprovers.value = true
        const res = await userService.getAll()
        const list = res.data?.data || res.data || []
        approverOptions.value = list.map(u => ({ value: u.id, label: u.name }))
    } finally {
        loadingApprovers.value = false
    }
}

watch(
    () => [props.visible, currentStepNo.value],
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
        await formApprovalService.approveVehicleDispatchStep(stepId, payload)
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
        await formApprovalService.rejectVehicleDispatchStep(stepId, {})
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

/* Gắn hành động cho từng ô */
const actions = {
    approveStep1: () => step1View.value.id && doApprove(step1View.value.id),
    approveStep2: () => step2View.value.id && doApprove(step2View.value.id),
    approveStep3: () => step3View.value.id && doApprove(step3View.value.id),
    rejectStep1: () => step1View.value.id && doReject(step1View.value.id),
    rejectStep2: () => step2View.value.id && doReject(step2View.value.id),
    rejectStep3: () => step3View.value.id && doReject(step3View.value.id),
}
</script>




<style scoped>
.signatures-table.two-cols td {
  width: 50%;
}
.signature-image {
    height: 100px;
    object-fit: contain;
    margin-bottom: 4px
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
</style>
