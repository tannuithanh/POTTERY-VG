<template>
    <a-card>
        <!-- Header -->
        <div class="card-header">
            <a-input v-model:value="keyword" placeholder="Tìm kiếm người dùng" allow-clear
                style="max-width: 300px; width: 100%; margin-bottom: 12px" />
            <a-button class="addButton" @click="showModal = true">
                + Thêm người dùng
            </a-button>
        </div>

        <!-- Table -->
        <a-table :columns="columns" :dataSource="filteredPermissions" rowKey="id" :pagination="false"
            :scroll="{ x: 'max-content' }" class="custom-user-table" />

        <!-- Modal -->
        <a-modal v-model:open="showModal" title="Phân quyền người dùng" ok-text="Lưu" cancel-text="Hủy" @ok="handleOk">
            <a-form layout="vertical" :model="formData">
                <a-form-item label="Tên người dùng" required>
                    <a-select v-model:value="formData.user" show-search allow-clear placeholder="Nhập tên người dùng"
                        :options="users.map(u => ({ label: u, value: u }))" />
                </a-form-item>

                <a-form-item label="Danh mục liên quan" required>
                    <a-select v-model:value="formData.categories" mode="multiple" placeholder="Chọn danh mục"
                        :options="categoryOptions" allow-clear />
                </a-form-item>
            </a-form>
        </a-modal>
    </a-card>
</template>

<script setup>
import { h, ref, computed } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

const keyword = ref('')
const showModal = ref(false)

const users = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C']
const categoryOptions = [
    { label: 'Tin nội bộ', value: 'Tin nội bộ' },
    { label: 'Thông báo hành chính', value: 'Thông báo hành chính' },
    { label: 'Tin tuyển dụng', value: 'Tin tuyển dụng' }
]

const permissions = ref([
    {
        id: 1,
        user: 'Nguyễn Văn A',
        categories: ['Tin nội bộ', 'Thông báo hành chính']
    },
    {
        id: 2,
        user: 'Trần Thị B',
        categories: ['Tin tuyển dụng']
    }
])

const columns = [
    {
        title: 'STT',
        customRender: ({ index }) => index + 1,
        width: 60
    },
    {
        title: 'Tên người dùng',
        dataIndex: 'user'
    },
    {
        title: 'Danh mục liên quan',
        key: 'categories',
        customRender: ({ record }) => record.categories.join(', ')
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

const formData = ref({
    user: '',
    categories: []
})

const filteredPermissions = computed(() =>
    permissions.value.filter((p) =>
        p.user.toLowerCase().includes(keyword.value.toLowerCase())
    )
)

function handleOk() {
    if (!formData.value.user || formData.value.categories.length === 0) return
    permissions.value.push({
        id: Date.now(),
        user: formData.value.user,
        categories: [...formData.value.categories]
    })
    formData.value = { user: '', categories: [] }
    showModal.value = false
}

function handleEdit(record) {
    console.log('Edit', record)
}

function handleDelete(record) {
    console.log('Delete', record)
}
</script>
