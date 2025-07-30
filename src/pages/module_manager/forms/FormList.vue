<template>
    <div>
        <a-card>
            <div class="card-header">
                <div class="section-title">Danh sách biểu mẫu</div>
                <a-button class="addButton" type="primary" @click="openCreateModal">+ Thêm biểu mẫu</a-button>

            </div>

            <a-table :dataSource="forms" :columns="columns" rowKey="id"  :scroll="{ x: 'max-content' }" bordered>
                <template #bodyCell="{ column, record }">
                    <!-- Kích hoạt -->
                    <template v-if="column.key === 'is_active'">
                        <a-switch :checked="record.is_active" @change="val => toggleActive(record, val)" />
                    </template>

                    <!-- Hành động -->
                    <template v-else-if="column.key === 'actions'">
                        <TableActionButtons :showEdit="true" :showDelete="true" :showView="false"
                            @edit="editForm(record)" @delete="deleteForm(record.id)" />
                    </template>
                </template>
            </a-table>

            <a-modal v-model:visible="showModal" :title="editingForm ? 'Sửa biểu mẫu' : 'Tạo biểu mẫu'"
                @ok="handleSubmit">
                <a-form :model="form" layout="vertical">
                    <a-form-item label="Mã biểu mẫu">
                        <a-input v-model:value="form.code" />
                    </a-form-item>
                    <a-form-item label="Tên biểu mẫu">
                        <a-input v-model:value="form.name" />
                    </a-form-item>
                    <a-form-item label="Mô tả">
                        <a-textarea v-model:value="form.description" />
                    </a-form-item>
                    <a-form-item label="Số bước duyệt">
                        <a-input-number v-model:value="form.steps_count" :min="1" />
                    </a-form-item>
                    <a-form-item label="Cấu trúc JSON Schema">
                        <a-textarea v-model:value="form.json_schema" :rows="6" :placeholder="placeholderJson" />
                    </a-form-item>

                </a-form>
            </a-modal>
        </a-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notification, Modal } from 'ant-design-vue'
import { formService } from '@/services/form_service/formService'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

const forms = ref([])
const showModal = ref(false)
const editingForm = ref(null)
const form = ref({
    code: '',
    name: '',
    description: '',
    steps_count: 1,
    json_schema: '',
})
const placeholderJson = `{
  "fields": [
    { "label": "Lý do", "name": "reason", "type": "text", "required": true },
    { "label": "Từ ngày", "name": "start_date", "type": "date" },
    { "label": "Đến ngày", "name": "end_date", "type": "date" }
  ]
}`

const columns = [
    {
        title: 'STT',
        key: 'index',
        customRender: ({ index }) => index + 1,
        align: 'center',
    },
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Số bước', dataIndex: 'steps_count', key: 'steps_count' },
    { title: 'Kích hoạt', key: 'is_active' },
    { title: 'Thao tác', key: 'actions' },
]

const loadForms = async () => {
    const res = await formService.getAll()
    forms.value = res.data
}

const openCreateModal = () => {
    resetForm()
    showModal.value = true
}

const resetForm = () => {
    form.value = {
        code: '',
        name: '',
        description: '',
        steps_count: 1,
        json_schema: ''
    }
    editingForm.value = null
}

const editForm = (item) => {
    editingForm.value = item
    form.value = {
        ...item,
        json_schema: JSON.stringify(item.json_schema, null, 2)
    }
    showModal.value = true
}

const deleteForm = (id) => {
    Modal.confirm({
        title: 'Xác nhận xoá biểu mẫu?',
        content: 'Bạn chắc chắn muốn xoá biểu mẫu này? Hành động này không thể hoàn tác.',
        okText: 'Xoá',
        okType: 'danger',
        cancelText: 'Huỷ',
        onOk: async () => {
            await formService.delete(id)
            notification.success({
                message: 'Thành công',
                description: 'Đã xoá biểu mẫu.',
            })
            loadForms()
        },
        onCancel() {
            notification.info({
                message: 'Đã huỷ xoá',
                description: 'Biểu mẫu vẫn được giữ nguyên.',
            })
        },
    })
}


const toggleActive = async (item, val) => {
    await formService.update(item.id, { ...item, is_active: val })
    notification.success({
        message: 'Đã cập nhật',
        description: 'Trạng thái kích hoạt đã được cập nhật.',
    })
    loadForms()
}

const handleSubmit = async () => {
    try {
        const payload = {
            ...form.value,
            json_schema: JSON.parse(form.value.json_schema),
        }

        if (editingForm.value) {
            await formService.update(editingForm.value.id, payload)
            notification.success({
                message: 'Thành công',
                description: 'Đã cập nhật biểu mẫu.',
            })
        } else {
            await formService.create(payload)
            notification.success({
                message: 'Thành công',
                description: 'Đã tạo biểu mẫu mới.',
            })
        }

        showModal.value = false
        loadForms()
    } catch (e) {
        notification.error({
            message: 'Lỗi khi xử lý biểu mẫu',
            description: 'Vui lòng kiểm tra lại JSON hoặc thông tin đầu vào.',
        })
        console.error(e)
    }
}

onMounted(() => loadForms())
</script>
