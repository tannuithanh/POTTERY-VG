<template>
  <a-modal :visible="props.visible" :footer="null" width="900px" wrap-class-name="modal-preview-fixed" >
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
        <div class="row right">
          <span>{{ currentDate }}</span>
        </div>

        <div class="row">
          <div class="col">
            <label>Tôi tên là</label><span>: {{ data.fullName }}</span>
          </div>
          <div class="col">
            <label>MSNV</label><span>: {{ data.msnv }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label>Bộ phận</label><span>: {{ data.department }}</span>
          </div>
          <div class="col">
            <label>Chức vụ</label><span>: {{ data.position }}</span>
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
              <td class="center">
                <strong>QUẢN LÝ TRỰC TIẾP</strong>
                <div class="signature">{{ managerName  }}</div>
              </td>
              <td class="center">
                <strong>NGƯỜI ĐỀ NGHỊ</strong>
                <div class="signature">{{ data.fullName }}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions">
          <a-button type="primary" @click="handleSubmit">Hoàn thành</a-button>
          <a-button danger @click="close">Huỷ bỏ</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/formatDate'

const props = defineProps({
  visible: Boolean,
  data: Object,
  managers: Array,
})

const emit = defineEmits(['update:visible', 'submit'])

const close = () => emit('update:visible', false)

const handleSubmit = () => emit('submit', props.data)

const fromDateFormatted = computed(() => formatDateTime(props.data?.fromDate))
const toDateFormatted = computed(() => formatDateTime(props.data?.toDate))

const currentDate = computed(() => {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  return `Ngày ${day} tháng ${month} năm ${year}`
})

const managerName = computed(() => {
  const found = props.managers.find((m) => m.id === props.data.managerId)
  return found ? found.name : '[Không xác định]'
})
</script>

<style scoped>
.print-area {
  font-family: Tahoma;
  background: white;
  padding: 24px;
  min-width: 800px; /* 👈 fix chiều rộng tối thiểu như desktop */
  overflow-x: auto; /* 👈 cho phép scroll ngang nếu không đủ */
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
    margin-top: 90px;
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
    margin-top: 80px;
    font-weight: normal;
}

.actions {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    gap: 16px;
}
</style>
