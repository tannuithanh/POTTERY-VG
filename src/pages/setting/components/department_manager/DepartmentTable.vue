<template>
    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách bộ phận</div>
            <a-button class="addButton" @click="showModal = true">+ Thêm phòng ban</a-button>
        </div>

        <a-table :columns="columns" :dataSource="departments" rowKey="id" bordered :pagination="{ pageSize: 10 }">
            <template #bodyCell="{ column, record }">
                <!-- Cột CODE -->
                <template v-if="column.dataIndex === 'code'">
                    <a-input v-if="editingId === record.id" v-model:value="editableCode" @pressEnter="saveEdit(record)"
                        @blur="saveEdit(record)" placeholder="Nhập mã bộ phận" />
                    <template v-else>{{ record.code }}</template>
                </template>

                <!-- Cột NAME -->
                <template v-if="column.dataIndex === 'name'">
                    <a-input v-if="editingId === record.id" v-model:value="editableName" @pressEnter="saveEdit(record)"
                        @blur="saveEdit(record)" placeholder="Nhập tên bộ phận" />
                    <template v-else>{{ record.name }}</template>
                </template>

                <!-- Actions -->
                <template v-if="column.key === 'actions'">
                    <TableActionButtons :showView="false" :showEdit="editingId !== record.id"
                        :showSave="editingId === record.id" :showCancel="editingId === record.id"
                        @edit="startEdit(record)" @save="saveEdit(record)" @cancel="cancelEdit"
                        @delete="() => handleDelete(record)" />
                </template>
            </template>
        </a-table>

        <!-- Modal thêm mới -->
        <a-modal v-model:visible="showModal" title="Thêm bộ phận" ok-text="Lưu" cancel-text="Hủy"
            :confirmLoading="isSaving" @ok="handleAdd">
            <a-form layout="vertical" :model="formData">
                <a-form-item label="Mã bộ phận" required>
                    <a-input v-model:value="formData.code" placeholder="Nhập mã bộ phận (duy nhất)" />
                </a-form-item>
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
const formData = ref({ name: '', code: '' })
const isSaving = ref(false)
const editingId = ref(null)
const editableName = ref('')
const editableCode = ref('')

const handleAdd = async () => {
    try {
        const name = (formData.value.name || '').trim()
        const code = (formData.value.code || '').trim()
        if (!code) return message.warning('Vui lòng nhập mã bộ phận')
        if (!name) return message.warning('Vui lòng nhập tên bộ phận')

        isSaving.value = true
        await departmentService.create({ name, code })
        notification.success({ message: 'Thêm bộ phận thành công' })
        showModal.value = false
        formData.value = { name: '', code: '' }
        emit('refresh')
    } catch (err) {
        // Thử đọc lỗi trùng mã
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            ''
        if (String(msg).toLowerCase().includes('code') && String(msg).toLowerCase().includes('unique')) {
            message.error('Mã bộ phận đã tồn tại, vui lòng dùng mã khác')
        } else {
            message.error('Lỗi khi thêm bộ phận')
        }
    } finally {
        isSaving.value = false
    }
}

const startEdit = (record) => {
    editingId.value = record.id
    editableName.value = record.name
    editableCode.value = record.code
}

const cancelEdit = () => {
    editingId.value = null
    editableName.value = ''
    editableCode.value = ''
}

const saveEdit = async (record) => {
    if (isSaving.value) return
    const name = (editableName.value || '').trim()
    const code = (editableCode.value || '').trim()

    if (!code) return message.warning('Vui lòng nhập mã bộ phận')
    if (!name) return message.warning('Vui lòng nhập tên bộ phận')

    // Nếu không thay đổi gì thì hủy edit
    if (name === record.name && code === record.code) {
        return cancelEdit()
    }

    try {
        isSaving.value = true
        await departmentService.update(record.id, { name, code })
        notification.success({ message: 'Cập nhật thành công' })
        emit('refresh')
        cancelEdit()
    } catch (err) {
        const msg =
            err?.response?.data?.message ||
            err?.message ||
            ''
        if (String(msg).toLowerCase().includes('code') && String(msg).toLowerCase().includes('unique')) {
            message.error('Mã bộ phận đã tồn tại, vui lòng dùng mã khác')
        } else {
            message.error('Lỗi khi cập nhật')
        }
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
                emit('refresh')
            } catch (err) {
                message.error('Lỗi khi xoá')
            }
        }
    })
}

const columns = [
    { title: 'STT', customRender: ({ index }) => index + 1, width: 60 },
    { title: 'Mã bộ phận', dataIndex: 'code', key: 'code' },
    { title: 'Tên bộ phận', dataIndex: 'name', key: 'name' },
    { title: 'Thao tác', key: 'actions' }
]
</script>
