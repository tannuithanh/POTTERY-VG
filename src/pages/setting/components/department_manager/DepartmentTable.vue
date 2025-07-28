<template>
    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách bộ phận</div>
            <a-button class="addButton" @click="showModal = true">+ Thêm phòng ban</a-button>
        </div>

        <a-table :columns="columns" :dataSource="departments" rowKey="id" bordered :pagination="{ pageSize: 10, }">

            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <a-input v-if="editingId === record.id" v-model:value="editableName" @pressEnter="saveEdit(record)"
                        @blur="saveEdit(record)" />
                    <template v-else>{{ record.name }}</template>
                </template>

                <template v-if="column.key === 'actions'">
                    <TableActionButtons :showView="false" :showEdit="editingId !== record.id"
                        :showSave="editingId === record.id" :showCancel="editingId === record.id"
                        @edit="startEdit(record)" @save="saveEdit(record)" @cancel="cancelEdit"
                        @delete="() => handleDelete(record)" />
                </template>
            </template>
        </a-table>

        <!-- Modal thêm mới -->
        <a-modal v-model:visible="showModal" title="Thêm bộ phận" ok-text="Lưu" cancel-text="Hủy" @ok="handleAdd">
            <a-form layout="vertical" :model="formData">
                <a-form-item label="Tên bộ phận" required>
                    <a-input v-model:value="formData.name" placeholder="Nhập tên bộ phận" />
                </a-form-item>
            </a-form>
        </a-modal>
    </a-card>
</template>

<script setup>
import { ref, h } from 'vue'
import departmentService from '@/services/departmentService'
import { message, notification, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

const props = defineProps({
    departments: { type: Array, default: () => [] }
})
const emit = defineEmits(['refresh'])

const showModal = ref(false)
const formData = ref({ name: '' })
const isSaving = ref(false)
const editingId = ref(null)
const editableName = ref('')

const handleAdd = async () => {
    try {
        const name = formData.value.name.trim()
        if (!name) return message.warning('Vui lòng nhập tên bộ phận')
        await departmentService.create({ name })
        notification.success({ message: 'Thêm bộ phận thành công' })
        showModal.value = false
        formData.value.name = ''
        emit('refresh') // 👈 Thông báo cho cha reload
    } catch (err) {
        message.error('Lỗi khi thêm bộ phận')
    }
}

const startEdit = (record) => {
    editingId.value = record.id
    editableName.value = record.name
}

const cancelEdit = () => {
    editingId.value = null
    editableName.value = ''
}

const saveEdit = async (record) => {
    if (isSaving.value) return
    const name = editableName.value.trim()
    if (!name || name === record.name) {
        cancelEdit()
        return
    }

    try {
        isSaving.value = true
        await departmentService.update(record.id, { name })
        notification.success({ message: 'Cập nhật thành công' })
        emit('refresh') // 👈 Reload lại ở cha
        cancelEdit()
    } catch (err) {
        message.error('Lỗi khi cập nhật')
    } finally {
        isSaving.value = false
    }
}

const handleDelete = (record) => {
    Modal.confirm({
        title: 'Xác nhận xoá',
        icon: h(ExclamationCircleOutlined),
        content: `Bạn có chắc chắn muốn xoá "${record.name}"?`,
        okText: 'Xoá',
        cancelText: 'Hủy',
        async onOk() {
            try {
                await departmentService.delete(record.id)
                notification.success({ message: 'Xoá thành công' })
                emit('refresh') // 👈 Reload sau xoá
            } catch (err) {
                message.error('Lỗi khi xoá')
            }
        }
    })
}

const columns = [
    { title: 'STT', customRender: ({ index }) => index + 1, width: 60 },
    { title: 'Tên bộ phận', dataIndex: 'name', key: 'name' },
    { title: 'Thao tác', key: 'actions' }
]
</script>
