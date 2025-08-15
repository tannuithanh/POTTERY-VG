<template>
  <div class="card-header">
    <div class="section-title">Danh sách thông tin hồ sơ</div>
  </div>

  <a-card bordered>
    <FormInstanceSearch
      :forms="formFilterOptions"
      @search="onSearch"
      @export="exportToExcel"
    />

    <a-table
      :columns="columns"
      :data-source="filteredInstances"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
      :scroll="{ x: 900 }"
      class="fi-table"
    />
  </a-card>

  <!-- Modal chi tiết động -->
  <component
    v-if="selectedRecord"
    :is="detailComponent"
    :visible="isPreviewVisible"
    :form-instance="selectedRecord"
    @close="onDetailClosed"
    @updated="onFormUpdated"
  />
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue'
import { Tag, Modal, notification, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useAuthStore } from '@/stores/auth'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import { formatDateTime } from '@/utils/formatDate'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import FormInstanceSearch from './FormInstanceSearch.vue'

/** Detail components cho từng loại form */
import FormInstanceDetail from './leaveForm/FormInstanceDetail.vue' // GateEntry detail
import FormVehicleDispatchDetail from './vehicleDispatchForm/FormVehicleDispatchDetail.vue'

/** Exporters – chỉ GateEntry hoạt động */
import { exportFormInstanceToExcel } from '@/utils/export-helper'

dayjs.extend(isBetween)

/* STATE */
const selectedRecord = ref(null)
const isPreviewVisible = ref(false)
const loading = ref(false)

const allInstances = ref([])
const filteredInstances = ref([])

/* Options filter form */
const formFilterOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Giấy ra vào cổng', value: 'GateEntry' },
  { label: 'Phiếu yêu cầu điều động xe', value: 'VehicleDispatch' }
]

/* Quyền xoá */
const authStore = useAuthStore()
const canDeleteFormInstance = computed(() => {
  const user = authStore.user
  if (user?.is_admin) return true
  const formModule = user?.modules?.find(m => m.code === 'form')
  return formModule?.actions?.includes('delete')
})

/* Cột bảng – gọn & responsive */
const columns = [
  { title: 'Stt', key: 'index', customRender: ({ index }) => index + 1, width: 70},
  { title: 'Biểu mẫu', dataIndex: ['form','name'], key: 'formName', width: 220, ellipsis: true },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: 'Người tạo', dataIndex: ['submitter_info','name'], key: 'creatorName', width: 200, ellipsis: true },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    customRender: ({ text }) => {
      const color = { pending: 'orange', approved: 'green', rejected: 'red' }[text] || 'blue'
      const viText = { pending: 'Đang chờ', approved: 'Đã duyệt', rejected: 'Từ chối' }[text] || text
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

/* Tải danh sách – dùng formInstanceService hiện có */
const fetchInstances = async () => {
  loading.value = true
  try {
    const res = await formInstanceService.getAll()
    allInstances.value = res.data || []
    filteredInstances.value = allInstances.value
  } catch (err) {
    message.error(`Lỗi khi tải danh sách phiếu: ${err?.response?.data?.message || err.message || 'Không rõ lỗi'}`)
  } finally {
    loading.value = false
  }
}

/* Lọc theo formCode, status, keyword, dateRange – lọc client-side */
const onSearch = (filters) => {
  const keyword = (filters.keyword || '').toLowerCase()
  const [startDate, endDate] = filters.dateRange || []
  const formCode = filters.formCode || ''
  const status = filters.status || ''

  filteredInstances.value = allInstances.value.filter(item => {
    const matchKeyword =
      (item.title || '').toLowerCase().includes(keyword) ||
      (item.submitter_info?.name || '').toLowerCase().includes(keyword)

    const matchDateRange = (startDate && endDate)
      ? dayjs(item.created_at).isBetween(
          dayjs(startDate).startOf('day'),
          dayjs(endDate).endOf('day'),
          null,
          '[]'
        )
      : true

    const matchForm = formCode ? (item.form?.code === formCode) : true
    const matchStatus = status ? (item.status === status) : true

    return matchKeyword && matchDateRange && matchForm && matchStatus
  })
}

/* Export – chỉ GateEntry được hỗ trợ theo utils hiện tại */
const exportToExcel = (filters) => {
  const list = filteredInstances.value
  if (!list.length) return message.info('Không có dữ liệu để xuất')

  const code = filters?.formCode

  if (!code || code === '') {
    // Tất cả → chỉ xuất GateEntry (những loại khác chưa hỗ trợ)
    const gate = list.filter(x => x.form?.code === 'GateEntry')
    if (!gate.length) return message.info('Không có dữ liệu Giấy ra vào cổng để xuất')
    return exportFormInstanceToExcel(gate)
  }

  if (code === 'GateEntry') {
    const gate = list.filter(x => x.form?.code === 'GateEntry')
    if (!gate.length) return message.info('Không có dữ liệu Giấy ra vào cổng để xuất')
    return exportFormInstanceToExcel(gate)
  }

  // Các form khác (VD VehicleDispatch) – chưa hỗ trợ
  message.info('Chức năng xuất Excel hiện chỉ hỗ trợ Giấy ra vào cổng.')
}

/* View chi tiết động theo form code */
const detailMap = {
  GateEntry: FormInstanceDetail,              // modal giấy ra vào cổng
  VehicleDispatch: FormVehicleDispatchDetail, // modal điều động xe
}
const detailComponent = computed(() => {
  const code = selectedRecord.value?.form?.code
  return code ? (detailMap[code] || FormInstanceDetail) : FormInstanceDetail
})

function handleView(record) {
  selectedRecord.value = record
  isPreviewVisible.value = true
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
    notification.success({ message: 'Thành công', description: res.data.message })
    fetchInstances()
  } catch (err) {
    if (err.message === 'Huỷ xoá') {
      notification.info({ message: 'Hủy xóa', description: 'Đã huỷ thao tác xoá' })
    } else {
      notification.error({
        message: 'Lỗi',
        description: err?.response?.data?.message || 'Lỗi không xác định khi xoá phiếu'
      })
    }
  }
}

function onDetailClosed() {
  isPreviewVisible.value = false
  selectedRecord.value = null
}
function onFormUpdated() {
  fetchInstances()
}

/* INIT */
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
