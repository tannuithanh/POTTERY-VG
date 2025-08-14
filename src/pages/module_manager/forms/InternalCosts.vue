<template>
    <a-card>
        <div>
            <div class="card-header">
                <div class="section-title">Danh sách hạng mục</div>
                <a-button type="primary" @click="openCreate = true">+ Thêm loại thiết bị</a-button>
            </div>

            <!-- Bảng: STT - Loại thiết bị - Thao tác -->
            <a-table :data-source="rows" :columns="columns" rowKey="id"
                :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }" bordered>
                <template #bodyCell="{ column, record, index }">
                    <!-- STT -->
                    <template v-if="column.key === 'stt'">
                        {{ index + 1 }}
                    </template>

                    <!-- Thao tác -->
                    <template v-if="column.key === 'actions'">
                        <a-popconfirm title="Xóa mục này?" ok-text="Xóa" cancel-text="Hủy"
                            ok-button-props="{ danger: true }" @confirm="onDelete(record.id)">
                            <TableActionButtons :showView="false" :showEdit="false" :showSave="false" :showCancel="false"
                                :showDelete="true" />
                        </a-popconfirm>
                    </template>
                </template>
            </a-table>

            <!-- Modal Thêm/Sửa -->
            <a-modal v-model:open="modalOpen" :title="isEditing ? 'Sửa loại thiết bị' : 'Thêm loại thiết bị'"
                :confirm-loading="saving" @ok="onSubmit" @cancel="onCancel" destroy-on-close>
                <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
                    <a-form-item label="Tên loại thiết bị" name="name" required>
                        <a-input v-model:value="form.name" placeholder="VD: Thiết bị mạng, Máy chủ..." />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>
    </a-card>

</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import { message } from 'ant-design-vue'

/* -------- Columns: STT - Loại thiết bị - Thao tác -------- */
const columns = [
    { title: 'STT', key: 'stt', width: 80, align: 'center' },
    { title: 'Loại thiết bị', dataIndex: 'name' },
    { title: 'Thao tác', key: 'actions', width: 120, align: 'center' },
]

/* -------- Data tạm (thay bằng API sau) -------- */
const rows = ref([
    { id: 'type_network', name: 'Thiết bị mạng' },
    { id: 'type_server', name: 'Máy chủ' },
    { id: 'type_office', name: 'Thiết bị văn phòng' },
])

/* -------- Modal & Form -------- */
const modalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formRef = ref()

const form = reactive({
    name: '',
})

const rules = {
    name: [
        { required: true, message: 'Nhập tên loại thiết bị' },
        {
            validator: (_, v) => {
                const val = (v || '').trim().toLowerCase()
                const dup = rows.value.some(r => r.name.trim().toLowerCase() === val && r.id !== editingId.value)
                return dup ? Promise.reject('Tên loại thiết bị đã tồn tại') : Promise.resolve()
            }
        }
    ]
}

/* -------- Helpers -------- */
const resetForm = () => {
    form.name = ''
    editingId.value = null
    isEditing.value = false
    nextTick(() => formRef.value?.clearValidate?.())
}

const openCreate = () => {
    resetForm()
    modalOpen.value = true
}

const openEdit = (record) => {
    resetForm()
    isEditing.value = true
    editingId.value = record.id
    form.name = record.name
    modalOpen.value = true
}

const onCancel = () => {
    modalOpen.value = false
}

/* -------- Submit (Create/Update) -------- */
const onSubmit = async () => {
    try {
        await formRef.value?.validate()
        saving.value = true

        const payload = {
            name: form.name.trim(),
        }

        if (isEditing.value && editingId.value) {
            // UPDATE
            // TODO: await api.updateDeviceType(editingId.value, payload)
            const idx = rows.value.findIndex(r => r.id === editingId.value)
            if (idx > -1) rows.value[idx] = { ...rows.value[idx], ...payload }
            message.success('Cập nhật thành công')
        } else {
            // CREATE
            // TODO: const { id } = await api.createDeviceType(payload)
            const id = `type_${Date.now()}`
            rows.value.unshift({ id, ...payload })
            message.success('Thêm thành công')
        }

        modalOpen.value = false
    } catch (e) {
        // validate fail or api error
        if (e?.errorFields) return
        message.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
        saving.value = false
    }
}

/* -------- Delete -------- */
const onDelete = async (id) => {
    try {
        // TODO: await api.deleteDeviceType(id)
        rows.value = rows.value.filter(r => r.id !== id)
        message.success('Đã xóa')
    } catch (e) {
        message.error('Xóa thất bại')
    }
}
</script>

<style scoped>
/* để Ant Design lo phần lớn UI, không cần thêm gì */
</style>
