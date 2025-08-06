<template>
    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách người dùng</div>
            <a-button class="addButton" @click="openCreateModal">+ Thêm nhân sự</a-button>
        </div>

        <a-table :columns="columns" :dataSource="users" rowKey="id" :scroll="{ x: 'max-content' }"
            :pagination="pagination" @change="handleTableChange" />


        <UserFormModal v-model:modelValue="showModal" :form="formData" :isEdit="isEdit"
            :currentUserIsAdmin="props.currentUserIdIsAdmin" @success="emit('refresh')" />



    </a-card>
</template>

<script setup>
import { ref, h } from 'vue'
import { Modal, message, notification } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import UserFormModal from './UserFormModal.vue'
import { resolveStoragePath } from '@/utils/storage'
import userService from '@/services/userService'

const props = defineProps({
    users: Array,
    currentUserId: Number,
    currentUserIdIsAdmin: Boolean
})

const emit = defineEmits(['refresh'])

const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
    name: '',
    msnv: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department_id: null,
    position_id: null,
    position_detail: '',
    division: '',
    isAdmin: 0,
})

const openCreateModal = () => {
    isEdit.value = false
    Object.assign(formData.value, {
        name: '',
        msnv: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        department_id: null,
        position_id: null,
        position_detail: '',
        division: '',
        isAdmin: false
    })
    showModal.value = true
}

const handleEdit = (record) => {

    if (record.id === props.currentUserId) {
        return message.warning('Không thể sửa chính bạn!')
    }
    isEdit.value = true
    Object.assign(formData.value, record)
    showModal.value = true
}

const handleDelete = (record) => {
    if (record.id === props.currentUserId) {
        return message.warning('Không thể xoá chính bạn!')
    }
    if (record.is_admin) {
        return message.warning('Không thể xoá tài khoản admin!')
    }

    Modal.confirm({
        title: 'Xác nhận xoá',
        icon: h(ExclamationCircleOutlined),
        content: `Bạn có chắc chắn muốn xoá "${record.name}"?`,
        async onOk() {
            try {
                await userService.delete(record.id)
                notification.success({ message: 'Xoá người dùng thành công' })
                emit('refresh')
            } catch (err) {
                message.error('Lỗi khi xoá')
            }
        }
    })
}
const pagination = ref({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true
})

const handleTableChange = (pag) => {
    pagination.value = { ...pagination.value, ...pag }
}

const columns = [
    {
        title: 'STT',
        key: 'stt',
        customRender: ({ index }) =>
            (pagination.value.current - 1) * pagination.value.pageSize + index + 1
    },
    { title: 'Họ và tên', dataIndex: 'name' },
    { title: 'Mã số nhân viên', dataIndex: 'msnv' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    { title: 'Chức vụ', dataIndex: ['position', 'name'] },
    { title: 'Chức vụ chi tiết', dataIndex: 'position_detail' },
    { title: 'Mail', dataIndex: 'email' },
    { title: 'Phòng ban', dataIndex: ['department', 'name'] },
    { title: 'Bộ phận', dataIndex: 'division' },
    {
        title: 'Avatar',
        dataIndex: 'avatar',
        customRender: ({ record }) =>
            h('img', {
                src: resolveStoragePath(record.avatar),
                style: 'width: 32px; height: 32px; border-radius: 50%'
            })
    },
    {
        title: 'Chữ ký',
        dataIndex: 'signature',
        customRender: ({ record }) =>
            h('img', {
                src: resolveStoragePath(record.signature),
                style: 'height: 100px'
            })
    },
    {
        title: 'Admin',
        dataIndex: 'is_admin',
        customRender: ({ record }) => (record.is_admin ? '✔️' : '')
    },
    {
        title: 'Thao tác',
        key: 'actions',
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: false,
                onEdit: () => handleEdit(record),
                onDelete: () => handleDelete(record)
            })
    }
]
</script>
