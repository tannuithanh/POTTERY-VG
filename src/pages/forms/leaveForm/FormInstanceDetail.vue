<template>
  <a-modal :visible="visible" :footer="null" width="900px" wrap-class-name="modal-preview-fixed" @cancel="close">
    <div class="print-area">
      <table class="form-header">
        <tbody>
          <tr>
            <td class="logo-cell" style="text-align: center;">
              <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
            </td>
            <td class="title-cell">
              <h1 style="margin-top:auto;margin-bottom:auto">GIẤY RA VÀO CỔNG</h1>
            </td>
            <td class="meta-cell" style="font-size: 13px;">
              <div><strong>MÃ SỐ:</strong> BM03/HCNS</div>
              <div><strong>LẦN BH:</strong> 02</div>
              <div><strong>NGÀY BH:</strong> 15/09/2023</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="form-body">
        <div style="text-align: right; width: 100%;">
          <span>
            Núi Thành, ngày {{ createdDay }} tháng {{ createdMonth }} năm {{ createdYear }}
          </span>

        </div>
        <div class="row">
          <div class="col">
            <label>Tôi tên là</label><span>: {{ props.formInstance.submitter_info.name }}</span>
          </div>
          <div class="col">
            <label>MSNV</label><span>: {{ props.formInstance.submitter_info.msnv }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label>Bộ phận</label><span>: {{ props.formInstance.submitter_info.department.name }}</span>
          </div>
          <div class="col">
            <label>Chức vụ</label><span>: {{ props.formInstance.submitter_info.position.name }}</span>
          </div>
        </div>

        <div>
          <p>Được ra vào cổng công ty TNHH Vinh Gia:</p>
        </div>

        <div class="row">
          <div class="col">
            <label>- Từ ngày</label><span>: {{ fromDateFormatted }}</span>
          </div>
          <div class="col">
            <label>Đến ngày</label><span>: {{ toDateFormatted }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label>- Lý do</label><span>: {{ data.reason }}</span>
          </div>
        </div>

        <table class="signatures-table">
          <tbody>
            <tr>
              <!-- QUẢN LÝ TRỰC TIẾP -->
              <td class="center">
                <strong>QUẢN LÝ TRỰC TIẾP</strong>
                <div class="signature">

                  <!-- ✅ Nếu user có quyền duyệt -->
                  <template v-if="canApprove">
                    <a-space direction="vertical" :size="8" style="width: 100%; text-align: center;">
                      <a-input v-model:value="comment" placeholder="Nhập ý kiến của bạn..."
                        :auto-size="{ minRows: 2, maxRows: 4 }" style="width: 100%;" />
                      <a-space>
                        <a-button type="primary" :loading="approving" @click="approve">
                          Đồng ý
                        </a-button>
                        <a-button danger :loading="rejecting" @click="reject">
                          Từ chối
                        </a-button>
                      </a-space>
                    </a-space>

                  </template>


                  <!-- ✅ Nếu đã duyệt và có chữ ký -->
                  <template v-else-if="step2Approved && step2HasSignature">
                    <div class="signature-wrapper" style="position: relative; display: inline-block;">
                      <!-- Ảnh chữ ký -->
                      <img :src="step2SignatureUrl" alt="Chữ ký quản lý" class="signature-image" />

                      <!-- Overlay thông tin -->
                      <div class="signature-overlay">
                        <p v-if="step2ProcessedAt">{{ formatDateTime(step2ProcessedAt) }}</p>
                        <p v-if="step2Comment">{{ step2Comment }}</p>
                      </div>
                    </div>
                  </template>




                  <template v-else-if="step2Rejected">
                    <img src="@/assets/images/reject.png" alt="Từ chối" class="signature-image" />
                  </template>

                  <!-- ✅ Luôn hiển thị tên người duyệt -->
                  <div class="signature-name">{{ ApproverName }}</div>

                </div>
              </td>


              <!-- NGƯỜI ĐỀ NGHỊ -->
              <td class="center">
                <strong>NGƯỜI ĐỀ NGHỊ</strong>
                <div class="signature">
                  <template v-if="props.formInstance?.steps?.[0]?.approver_info?.signature">
                    <img :src="resolveStoragePath(props.formInstance.steps[0].approver_info.signature)"
                      alt="Chữ ký người đề nghị" class="signature-image" />
                  </template>
                  <template v-else>
                    <div class="no-signature">Không có chữ ký</div>
                  </template>
                  <div class="signature-name">{{ firstApproverName }}</div>
                </div>
              </td>

            </tr>
          </tbody>
        </table>

      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/formatDate'
import { formApprovalService } from '@/services/form_service/formApprovalService'
import { resolveStoragePath } from '@/utils/storage'
import { notification } from 'ant-design-vue'
/* ──────────────────────────────────────────────────────────────
  I. KHAI BÁO CƠ BẢN
─────────────────────────────────────────────────────────────── */

const props = defineProps({
  visible: Boolean,
  formInstance: Object,
})

const emit = defineEmits(['close', 'updated'])

const data = computed(() => props.formInstance?.data || {})

// Giả sử created_at là ISO string từ backend
const createdAt = computed(() => new Date(props.formInstance?.created_at))

const createdDay = computed(() =>
  createdAt.value.getDate().toString().padStart(2, '0')
)

const createdMonth = computed(() =>
  (createdAt.value.getMonth() + 1).toString().padStart(2, '0')
)

const createdYear = computed(() => createdAt.value.getFullYear())



const fromDateFormatted = formatDateTime(data.value.fromDate)
const toDateFormatted = formatDateTime(data.value.toDate)

/* ──────────────────────────────────────────────────────────────
  II. THÔNG TIN NGƯỜI DÙNG ĐĂNG NHẬP
─────────────────────────────────────────────────────────────── */

const authStore = useAuthStore()
console.log(authStore)
const currentUserId = computed(() => authStore.user?.id)

/* ──────────────────────────────────────────────────────────────
  III. LOGIC PHÊ DUYỆT CHO STEP ĐANG CHỜ
─────────────────────────────────────────────────────────────── */

// Tìm bước đầu tiên có trạng thái 'pending'
const currentApprovalStep = computed(() =>
  props.formInstance?.steps?.find(
    step =>
      step.status === 'pending' &&
      step.approver_id === currentUserId.value
  )
)


const canApprove = computed(() => {
  const step = currentApprovalStep.value
  const form = props.formInstance

  return (
    step &&
    form &&
    step.approver_id === currentUserId.value &&
    step.status === 'pending' &&
    step.step === form.current_step // 👈 THÊM DÒNG NÀY
  )
})

/* ──────────────────────────────────────────────────────────────
  IV. XỬ LÝ DỮ LIỆU NGƯỜI ĐỀ NGHỊ (STEP 0)
─────────────────────────────────────────────────────────────── */

// Hiển thị tên người đề nghị (bước 0)
const firstApproverName = computed(() => {
  const step = props.formInstance?.steps?.[0]
  return step?.approver_info?.name || '—'
})

// Đường dẫn chữ ký người đề nghị nếu có
const submitterSignaturePath = computed(() =>
  props.formInstance?.steps?.[0]?.approver_info?.signature
)

const submitterSignatureUrl = computed(() =>
  resolveStoragePath(submitterSignaturePath.value)
)

/* ──────────────────────────────────────────────────────────────
  V. XỬ LÝ DỮ LIỆU "QUẢN LÝ TRỰC TIẾP" (STEP 1)
─────────────────────────────────────────────────────────────── */

// Lấy step 1 – tương ứng “quản lý trực tiếp”
const step2 = computed(() => props.formInstance?.steps?.[1])

//Lấy giờ xác nhận và comment
const step2ProcessedAt = computed(() => step2.value?.processed_at)
const step2Comment = computed(() => step2.value?.comment)

// Hiển thị tên người duyệt bước 2
const ApproverName = computed(() => step2.value?.approver_info?.name || '—')

// Kiểm tra bước 2 đã được duyệt chưa
const step2Approved = computed(() =>
  step2.value?.status === 'approved'
)

const step2Rejected = computed(() =>
  step2.value?.status === 'rejected'
)
// Kiểm tra có chữ ký ở bước 2 không
const step2HasSignature = computed(() =>
  !!step2.value?.approver_info?.signature
)

// Đường dẫn chữ ký bước 2
const step2SignatureUrl = computed(() =>
  resolveStoragePath(step2.value?.approver_info?.signature)
)

/* ──────────────────────────────────────────────────────────────
  VI. HÀNH ĐỘNG DUYỆT / TỪ CHỐI
─────────────────────────────────────────────────────────────── */

// Nội dung comment người duyệt nhập
const comment = ref('')

const approving = ref(false)
const rejecting = ref(false)
// DUyệt
async function approve() {
  if (!currentApprovalStep.value) return
  approving.value = true
  try {
    await formApprovalService.approveStep(currentApprovalStep.value.id, {
      comment: comment.value
    })
    notification.success({
      message: 'Phê duyệt thành công',
      description: 'Phiếu đã được duyệt.'
    })
    emit('updated')
    emit('close')
  } catch (err) {
    notification.error({
      message: 'Lỗi khi duyệt',
      description: err.response?.data?.message || 'Đã có lỗi xảy ra.'
    })
  } finally {
    approving.value = false
  }
}

//Từ chối
async function reject() {
  if (!currentApprovalStep.value) return
  rejecting.value = true
  try {
    await formApprovalService.rejectStep(currentApprovalStep.value.id, {
      comment: comment.value
    })
    notification.success({
      message: 'Từ chối thành công',
      description: 'Phiếu đã bị từ chối.'
    })
    emit('updated')
    emit('close')
  } catch (err) {
    notification.error({
      message: 'Lỗi khi từ chối',
      description: err.response?.data?.message || 'Đã có lỗi xảy ra.'
    })
  } finally {
    rejecting.value = false
  }
}
// Đóng modal xem phiếu
function close() {
  emit('close')
}

/* ──────────────────────────────────────────────────────────────
  VII. DEBUG (nếu cần)
─────────────────────────────────────────────────────────────── */

</script>


<style scoped>
.print-area {
  font-family: Tahoma;
  background: white;
  padding: 24px;
  min-width: 800px;
  /* 👈 fix chiều rộng tối thiểu như desktop */
  overflow-x: auto;
  /* 👈 cho phép scroll ngang nếu không đủ */
}

.signatures-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 50px;
}

.signatures-table td {
  padding: 16px;
  vertical-align: top;
  border: none;
  /* ẩn border */
}

.center {
  text-align: center;
}

.signature {
  /* để cách tên với dòng ký */
  font-weight: bold;
  text-decoration: underline;
}

.review-modal :deep(.ant-modal-content) {
  padding: 0;
}

.print-area {
  font-family: Tahoma;
  background: white;
  padding: 24px;
}

.form-header {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid black;
}

.logo-cell,
.title-cell,
.meta-cell {
  border: 1px solid black;
  padding: 8px;
  vertical-align: middle;
}

.logo {
  width: 80px;
}

.title-cell {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.meta-cell {
  font-size: 14px;
}

.form-body {
  margin-top: 24px;
}

.row {
  display: flex;
  margin-bottom: 8px;
  gap: 16px;
}

.col {
  width: 50%;
  display: flex;
}

.right {
  justify-content: flex-end;
}

label {
  width: 120px;
  font-weight: 600;
}

span {
  flex: 1;
}

.signatures {
  display: flex;
  justify-content: space-around;
  margin-top: 48px;
  text-align: center;
}

.signature {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding-top: 4px;
}

.signature-image {
  height: 100px;
  object-fit: contain;
  margin-bottom: 4px;
}

.no-signature {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  font-style: italic;
}

.signature-name {
  font-weight: 500;
  margin-top: 4px;
  text-align: center;
}

.actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.signature-wrapper {
  position: relative;
  width: fit-content;
}

.signature-image {
  max-height: 80px;
}

.signature-overlay {
  position: absolute;
  bottom: 0px;
  right: -120px;
  padding: 0px 0px;
  font-size: 11px;
  text-align: left;
  line-height: 1.3;
  max-width: 262px;
  border-radius: 0px;
  color: red;
}
</style>