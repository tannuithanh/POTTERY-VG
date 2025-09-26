<template>
  <div class="card-header">
    <div class="section-title">Danh sách thông tin hồ sơ</div>
  </div>

  <a-card bordered>
    <FormInstanceSearch :forms="formFilterOptions" @search="onSearch" @export="exportToExcel" />

    <!-- 1) DÙNG pagination ref + @change -->
    <a-table :columns="columns" :data-source="filteredInstances" :loading="loading" row-key="id"
      :pagination="pagination" :scroll="{ x: 1000 }" class="fi-table" @change="onTableChange" />
  </a-card>

  <!-- Modal chi tiết động -->
  <component v-if="isPreviewVisible && selectedRecord" :key="detailKey" :is="detailComponent"
    :visible="isPreviewVisible" :form-instance="selectedRecord" @close="onDetailClosed" @updated="onFormUpdated" />
</template>

<script setup>
import { ref, onMounted, computed, h, nextTick } from 'vue'
import { Tag, Modal, notification, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useAuthStore } from '@/stores/auth'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import { formatDateTime } from '@/utils/formatDate'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import FormInstanceSearch from './FormInstanceSearch.vue'

/** Detail components */
import FormInstanceDetail from './leaveForm/FormInstanceDetail.vue'
import FormVehicleDispatchDetail from './vehicleDispatchForm/FormVehicleDispatchDetail.vue'
import MaterialGatepassDetail from './materialGatepassForm/MaterialGatepassDetail.vue'

dayjs.extend(isBetween)

/* ===== STATE ===== */
const selectedRecord = ref(null)
const isPreviewVisible = ref(false)
const loading = ref(false)

const allInstances = ref([])
const filteredInstances = ref([])

/* Phân trang chủ động (quan trọng) */
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
})

/* Force re-mount key cho modal chi tiết */
const detailKey = ref(0)
const bumpDetailKey = () => { detailKey.value += 1 }

/* ===== Filter options ===== */
const formFilterOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Giấy ra vào cổng', value: 'GateEntry' },
  { label: 'Phiếu yêu cầu điều động xe', value: 'VehicleDispatch' },
  { label: 'Phiếu mang vật tư ra cổng', value: 'MaterialGatepass' },
]

/* ===== Quyền xoá ===== */
const authStore = useAuthStore()
const canDeleteFormInstance = computed(() => {
  const user = authStore.user
  if (user?.is_admin) return true
  const formModule = user?.modules?.find(m => m.code === 'form')
  return formModule?.actions?.includes('delete')
})

/* ===== Cột bảng ===== */
/* 2) STT phải cộng offset theo trang */
const columns = [
  {
    title: 'Stt',
    key: 'index',
    width: 70,
    customRender: ({ index }) =>
      (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
  },
  { title: 'Biểu mẫu', dataIndex: ['form', 'name'], key: 'formName', width: 240, ellipsis: true },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 350 },
  { title: 'Người tạo', dataIndex: ['submitter_info', 'name'], key: 'creatorName', width: 200, ellipsis: true },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    customRender: ({ text }) => {
      const colorMap = { pending: 'orange', approved: 'green', rejected: 'red', in_progress: 'blue' }
      const viMap = { pending: 'Đang chờ', approved: 'Đã duyệt', rejected: 'Từ chối', in_progress: 'Đang xử lý' }
      const color = colorMap[text] || 'blue'
      const viText = viMap[text] || text
      return h(Tag, { color }, () => viText)
    }
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    customRender: ({ text }) => formatDateTime(text),
  },
  {
    title: 'Hành động',
    key: 'action',
    width: 140,
    customRender: ({ record }) => h(TableActionButtons, {
      onView: () => handleView(record),
      showEdit: false,
      showDelete: canDeleteFormInstance.value,
      onDelete: () => handleDelete(record)
    })
  }
]

/* ===== Fetch list ===== */
const fetchInstances = async () => {
  loading.value = true
  try {
    const res = await formInstanceService.getAll()
    const data = Array.isArray(res?.data) ? res.data
      : Array.isArray(res?.data?.data) ? res.data.data
        : res?.data?.items || []
    allInstances.value = data
    filteredInstances.value = data

    /* 3) Cập nhật tổng sau khi nạp dữ liệu */
    pagination.value.total = filteredInstances.value.length
    pagination.value.current = 1
  } catch (err) {
    message.error(`Lỗi khi tải danh sách phiếu: ${err?.response?.data?.message || err.message || 'Không rõ lỗi'}`)
  } finally {
    loading.value = false
  }
}

/* ===== Search (client-side) ===== */
/* 3) Reset về trang 1 và cập nhật total sau khi lọc */
const onSearch = (filters) => {
  const keyword = (filters.keyword || '').toLowerCase()
  const [startDate, endDate] = filters.dateRange || []
  const formCode = filters.formCode || ''
  const status = filters.status || ''

  filteredInstances.value = (allInstances.value || []).filter(item => {
    const matchKeyword =
      (item.title || '').toLowerCase().includes(keyword) ||
      (item.submitter_info?.name || '').toLowerCase().includes(keyword)

    const matchDateRange = (startDate && endDate)
      ? dayjs(item.created_at).isBetween(dayjs(startDate).startOf('day'), dayjs(endDate).endOf('day'), null, '[]')
      : true

    const matchForm = formCode ? (item.form?.code === formCode) : true
    const matchStatus = status ? (item.status === status) : true

    return matchKeyword && matchDateRange && matchForm && matchStatus
  })

  pagination.value.current = 1
  pagination.value.total = filteredInstances.value.length
}

/* Bắt sự kiện đổi trang/đổi kích thước trang từ a-table */
function onTableChange(pag /*, filters, sorter, extra */) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

/* ===== Export (GateEntry only) ===== */
import { exportFormInstanceToExcel } from '@/utils/export-helper'
const exportToExcel = (filters) => {
  const list = filteredInstances.value
  if (!list.length) return message.info('Không có dữ liệu để xuất')

  const code = filters?.formCode
  if (!code || code === '') {
    const gate = list.filter(x => x.form?.code === 'GateEntry')
    if (!gate.length) return message.info('Không có dữ liệu Giấy ra vào cổng để xuất')
    return exportFormInstanceToExcel(gate)
  }

  if (code === 'GateEntry') {
    const gate = list.filter(x => x.form?.code === 'GateEntry')
    if (!gate.length) return message.info('Không có dữ liệu Giấy ra vào cổng để xuất')
    return exportFormInstanceToExcel(gate)
  }

  message.info('Chức năng xuất Excel hiện chỉ hỗ trợ Giấy ra vào cổng.')
}

/* ===== Detail component mapping ===== */
const detailMap = {
  GateEntry: FormInstanceDetail,
  VehicleDispatch: FormVehicleDispatchDetail,
  MaterialGatepass: MaterialGatepassDetail,
}
const detailComponent = computed(() => {
  const code = selectedRecord.value?.form?.code
  return code ? (detailMap[code] || FormInstanceDetail) : FormInstanceDetail
})

/* ===== Handlers ===== */
function handleView(record) {
  selectedRecord.value = record
  isPreviewVisible.value = true
  bumpDetailKey() // để lần sau luôn re-mount
}

async function handleDelete(record) {
  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: 'Xác nhận xoá phiếu?',
        content: `Bạn có chắc muốn xoá phiếu "${record.title}"?`,
        okText: 'Xoá',
        okType: 'danger',
        cancelText: 'Huỷ',
        onOk: resolve,
        onCancel: () => reject(new Error('Huỷ xoá'))
      })
    })

    const res = await formInstanceService.deleteFormInstance(record.id)
    notification.success({ message: 'Thành công', description: res?.data?.message || 'Đã xoá phiếu' })

    // 👉 luôn đóng và bỏ mount modal chi tiết
    isPreviewVisible.value = false
    selectedRecord.value = null
    await nextTick()
    bumpDetailKey()

    // 👉 quét sạch mọi modal treo (kể cả confirm)
    Modal.destroyAll()

    await fetchInstances()
  } catch (err) {
    if (err?.message === 'Huỷ xoá') {
      notification.info({ message: 'Hủy xóa', description: 'Đã huỷ thao tác xoá' })
    } else {
      notification.error({
        message: 'Lỗi',
        description: err?.response?.data?.message || err?.message || 'Lỗi không xác định khi xoá phiếu'
      })
    }
  }
}

function onDetailClosed() {
  isPreviewVisible.value = false
  selectedRecord.value = null
  bumpDetailKey()
}

function onFormUpdated() {
  fetchInstances()
}

/* ===== INIT ===== */
onMounted(fetchInstances)
</script>

<style scoped>
.section-title {
  font-weight: 700;
  font-size: 16px;
}

.fi-table :deep(.ant-table) {
  font-size: 13px;
}
</style>
