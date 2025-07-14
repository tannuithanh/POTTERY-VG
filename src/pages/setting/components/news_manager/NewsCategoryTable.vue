<template>
    <a-card>
        <!-- Header -->
        <div class="card-header">
            <a-input v-model:value="keyword" placeholder="Tìm kiếm hạng mục" allow-clear
                style="max-width: 300px; width: 100%; margin-bottom: 12px" />
            <a-button class="addButton" type="primary" @click="showModal = true">
                + Thêm hạng mục
            </a-button>
        </div>

        <!-- Table -->
        <a-table :columns="columns" :dataSource="filteredCategories" rowKey="id" :pagination="false"
            :scroll="{ x: 'max-content' }" class="custom-user-table" />

        <!-- Modal -->
        <a-modal v-model:open="showModal" title="Thêm hạng mục bảng tin" ok-text="Lưu" cancel-text="Hủy" @ok="handleOk">
            <a-form layout="vertical" :model="formData">
                <a-form-item label="Tên hạng mục" required>
                    <a-input v-model:value="formData.name" placeholder="Nhập tên hạng mục" />
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
const formData = ref({ name: '' })

const categories = ref([
    { id: 1, name: 'Tin tức nội bộ', createdBy: 'Nguyễn Văn A' },
    { id: 2, name: 'Thông báo hành chính', createdBy: 'Trần Thị B' }
])

const columns = [
    {
        title: 'STT',
        customRender: ({ index }) => index + 1,
        width: 60
    },
    {
        title: 'Tên hạng mục',
        dataIndex: 'name'
    },
    {
        title: 'Người tạo',
        dataIndex: 'createdBy'
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

const filteredCategories = computed(() =>
    categories.value.filter((item) =>
        item.name.toLowerCase().includes(keyword.value.toLowerCase())
    )
)

function handleOk() {
    if (!formData.value.name.trim()) return
    categories.value.push({
        id: Date.now(),
        name: formData.value.name,
        createdBy: 'Admin'
    })
    formData.value.name = ''
    showModal.value = false
}

function handleEdit(record) {
    console.log('Edit', record)
}

function handleDelete(record) {
    console.log('Delete', record)
}
</script>

<style scoped>
.card-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.addButton {
    background-color: #c06252;
    border-color: #c06252;
    color: white;
}

.addButton:hover {
    opacity: 0.9;
}
</style>
