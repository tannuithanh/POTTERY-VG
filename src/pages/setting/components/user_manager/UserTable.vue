<template>

    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách người dùng</div>
            <a-button class="addButton" @click="showModal = true">
                + Thêm nhân sự
            </a-button>
        </div>
        <div style="overflow-x: auto">
            <a-table :columns="columns" :dataSource="data" rowKey="id" :scroll="{ x: 'max-content' }"
                class="custom-user-table" />
        </div>
    </a-card>

    <!-- Modal thêm nhân sự -->
    <a-modal v-model:open="showModal" title="Thêm nhân sự" @ok="handleOk" ok-text="Lưu" cancel-text="Hủy">
        <a-form layout="vertical" :model="formData">
            <a-form-item label="Họ và tên">
                <a-input v-model:value="formData.name" placeholder="Nhập họ và tên" />
            </a-form-item>

            <a-form-item label="Mã số nhân viên">
                <a-input v-model:value="formData.employeeCode" placeholder="Mã số nhân viên" />
            </a-form-item>

            <a-form-item label="Chức vụ">
                <a-input v-model:value="formData.position" placeholder="Nhập chức vụ" />
            </a-form-item>

            <a-form-item label="Mô tả chức vụ">
                <a-input v-model:value="formData.positionDesc" placeholder="Nhập mô tả" />
            </a-form-item>

            <a-form-item label="Mail">
                <a-input v-model:value="formData.email" placeholder="example@company.com" />
            </a-form-item>

            <a-form-item label="Phòng ban">
                <a-select v-model:value="formData.department" show-search allow-clear placeholder="Chọn phòng ban"
                    :options="departments.map(d => ({ label: d, value: d }))" />
            </a-form-item>

            <a-form-item label="Bộ phận">
                <a-input v-model:value="formData.unit" placeholder="Nhập bộ phận" />
            </a-form-item>

            <a-form-item label="Quyền truy cập">
                <a-radio-group v-model:value="formData.isAdmin">
                    <a-radio :value="true">Admin</a-radio>
                    <a-radio :value="false">Người dùng thường</a-radio>
                </a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { h, ref } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import { Modal, message, notification  } from 'ant-design-vue'
import { ExclamationCircleOutlined, } from '@ant-design/icons-vue'

const columns = [
    {
        title: 'STT',
        dataIndex: 'index',
        customRender: ({ index }) => index + 1,
        width: 60
    },
    { title: 'Họ và tên', dataIndex: 'name' },
    { title: 'Chức vụ', dataIndex: 'position' },
    { title: 'Mô tả chức vụ', dataIndex: 'positionDescription' },
    { title: 'Mail', dataIndex: 'email' },
    { title: 'Phòng ban', dataIndex: 'department' },
    { title: 'Bộ phận', dataIndex: 'division' },
    {
        title: 'Avatar',
        dataIndex: 'avatar',
        customRender: ({ record }) =>
            h('img', {
                src: record.avatar,
                alt: 'avatar',
                style: 'width: 32px; height: 32px; border-radius: 50%'
            })
    },
    {
        title: 'Chữ ký',
        dataIndex: 'signature',
        customRender: ({ record }) =>
            h('img', {
                src: record.signature,
                alt: 'signature',
                style: 'height: 100px'
            })
    },
    {
        title: 'Admin',
        dataIndex: 'isAdmin',
        customRender: ({ record }) =>
            record.isAdmin ? '✔️' : ''
    },
    {
        title: 'Thao tác',
        key: 'actions',
        customRender: ({ record }) =>
            h(TableActionButtons, {
                onView: () => handleView(record),
                onEdit: () => handleEdit(record),
                onDelete: () => handleDelete(record)
            })
    }
]

const data = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        position: 'Trưởng phòng',
        positionDescription: 'Quản lý toàn bộ hoạt động phòng kinh doanh',
        email: 'a@company.com',
        department: 'Kinh doanh',
        division: 'Khu vực phía Bắc',
        avatar: 'https://i.pravatar.cc/150?img=1',
        signature: 'https://chukydep.vn/Upload/post/chu-ky-ten-chi.jpg',
        isAdmin: true
    },
    {
        id: 2,
        name: 'Trần Thị B',
        position: 'Nhân viên',
        positionDescription: 'Xử lý nghiệp vụ kế toán',
        email: 'b@company.com',
        department: 'Kế toán',
        division: 'Chi nhánh HCM',
        avatar: 'https://i.pravatar.cc/150?img=2',
        signature: 'https://chukydep.vn/Upload/post/chu-ky-ten-chi.jpg',
        isAdmin: false
    }
]
const showModal = ref(false)

const formData = ref({
    name: '',
    employeeCode: '',
    position: '',
    positionDesc: '',
    email: '',
    department: '',
    unit: '',
    isAdmin: false
})

const departments = ['Kinh doanh', 'Nhân sự', 'Kỹ thuật']

function handleOk() {
    console.log('Thông tin nhân sự:', formData.value)
    // TODO: Gửi dữ liệu về backend
    showModal.value = false
}

const handleDelete = (record) => {
    Modal.confirm({
        title: 'Are you sure delete this task?',
        icon: h(ExclamationCircleOutlined),
        content: `Bạn có chắc chắn muốn xoá nhân sự "${record.name}"?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
            
notification.success({
  message: 'Thành công',
  description: 'Bạn đã xoá nhân sự thành công.',
})
        },
        onCancel() {
            message.error('Đã có lỗi xảy ra.')
        },
    });
};
</script>
