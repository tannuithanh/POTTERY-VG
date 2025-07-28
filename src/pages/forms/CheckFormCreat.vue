<template>
  <div class="card-header">
    <div class="section-title">Danh sách thông tin hồ sơ</div>
  </div>
  <div>
    <a-card bordered>
      <FormInstanceSearch @search="onSearch"  @export="exportToExcel" />

      <a-table :columns="columns" :data-source="filteredInstances" :loading="loading" row-key="id"
        :pagination="{ pageSize: 10 }" :scroll="{ x: 'max-content' }"  />
    </a-card>
  </div>
  <FormInstanceDetail v-if="selectedRecord" :visible="isPreviewVisible" :form-instance="selectedRecord"
    @close="onDetailClosed" @updated="onFormUpdated"/>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { h } from 'vue'
import { Tag, Modal, notification, message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import { formatDateTime } from '@/utils/formatDate'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import FormInstanceDetail from './leaveForm/FormInstanceDetail.vue'
import FormInstanceSearch from './FormInstanceSearch.vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { exportFormInstanceToExcel } from '@/utils/export-helper'


dayjs.extend(isBetween)
// ─────────────────────────────────────────────────────────────────────────────
// BIẾN TRẠNG THÁI
// ─────────────────────────────────────────────────────────────────────────────
const selectedRecord = ref(null) // phiếu được chọn để xem chi tiết
const isPreviewVisible = ref(false) // hiển thị modal chi tiết
const loading = ref(false) // loading table

const allInstances = ref([]) // tất cả phiếu lấy từ API
const filteredInstances = ref([]) // danh sách sau khi lọc tìm kiếm

const exportToExcel = () => {
  exportFormInstanceToExcel(filteredInstances.value)
}
// ─────────────────────────────────────────────────────────────────────────────
// PHÂN QUYỀN XÓA
// ─────────────────────────────────────────────────────────────────────────────
const authStore = useAuthStore()
const canDeleteFormInstance = computed(() => {
  const user = authStore.user
  if (user?.is_admin) return true
  const formModule = user?.modules?.find(m => m.code === 'form')
  return formModule?.actions?.includes('delete')
})

// ─────────────────────────────────────────────────────────────────────────────
// CẤU HÌNH CỘT BẢNG
// ─────────────────────────────────────────────────────────────────────────────
const columns = [
  { title: 'Stt', dataIndex: 'index', key: 'index', customRender: ({ index }) => index + 1 },
  { title: 'Tên biểu mẫu', dataIndex: ['form', 'name'], key: 'formName' },
  { title: 'Tiêu đề phiếu', dataIndex: 'title', key: 'title' },
  { title: 'Người tạo', dataIndex: ['submitter_info', 'name'], key: 'creatorName' },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
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
    customRender: ({ text }) => formatDateTime(text),
  },
  {
    title: 'Hành động',
    key: 'action',
    customRender: ({ record }) => h(TableActionButtons, {
      onView: () => handleView(record),
      showEdit: false,
      showDelete: canDeleteFormInstance.value,
      onDelete: () => handleDelete(record)
    })
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// API LẤY DANH SÁCH PHIẾU
// ─────────────────────────────────────────────────────────────────────────────
const fetchInstances = async () => {
  loading.value = true
  try {
    const res = await formInstanceService.getAll()
    allInstances.value = res.data.data || []
    filteredInstances.value = allInstances.value
    console.log(filteredInstances.value)
  } catch (err) {
    console.error('Lỗi khi tải danh sách phiếu:', err)
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// XỬ LÝ TÌM KIẾM
// ─────────────────────────────────────────────────────────────────────────────
const onSearch = (filters) => {
  const keyword = filters.keyword?.toLowerCase() || ''
  const [startDate, endDate] = filters.dateRange || []

  filteredInstances.value = allInstances.value.filter(item => {
    const matchKeyword =
      item.title?.toLowerCase().includes(keyword) ||
      item.submitter_info?.name?.toLowerCase().includes(keyword)

    const matchDateRange = (startDate && endDate)
      ? dayjs(item.created_at).isBetween(
        dayjs(startDate).startOf('day'),
        dayjs(endDate).endOf('day'),
        null,
        '[]' // inclusive
      )
      : true

    return matchKeyword && matchDateRange
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// HÀM XEM, XOÁ, ĐÓNG, CẬP NHẬT
// ─────────────────────────────────────────────────────────────────────────────
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
        async onOk() {
          resolve()
        },
        onCancel() {
          reject(new Error('Huỷ xoá'))
        }
      })
    })

    const res = await formInstanceService.deleteFormInstance(record.id)
    notification.success({
      message: 'Thành công',
      description: res.data.message
    })

    fetchInstances()

  } catch (err) {
    if (err.message === 'Huỷ xoá') {
      notification.info({
        message: 'Hủy xóa',
        description: 'Đã huỷ thao tác xoá'
      })
    } else if (err.response?.data?.message) {
      notification.error({
        message: 'Lỗi',
        description: err.response.data.message
      })
    } else {
      notification.error({
        message: 'Lỗi',
        description: 'Lỗi không xác định khi xoá phiếu'
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

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchInstances()
})
</script>
