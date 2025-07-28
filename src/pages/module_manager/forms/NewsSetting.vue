<template>
    <a-space direction="vertical" size="large" style="width: 100%">
        <!-- Bảng 1: Hạng mục bảng tin -->
        <a-card>
            <div class="card-header">
                <div class="section-title">Danh sách hạng mục</div>
                <a-button class="addButton" @click="showModal = true">+ Thêm hạng mục</a-button>
            </div>

            <a-table :columns="newsCategoryColumns" :data-source="newsCategoryData" row-key="id" bordered />
        </a-card>

        <!-- Bảng 2: Phân quyền chức năng -->
        <a-card>
            <div class="card-header">
                <div class="section-title">Danh sách phân quyền</div>
                <a-button class="addButton" @click="showModal = true">+ Phân quyền</a-button>
            </div>
            <a-table :columns="permissionColumns" :data-source="permissionData" row-key="id" bordered />
        </a-card>
    </a-space>
</template>

<script setup>
import { ref } from 'vue'

const newsCategoryColumns = [
    { title: 'Stt', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên hạng mục', dataIndex: 'name', key: 'name' },
    { title: 'Người tạo', dataIndex: 'created_by', key: 'created_by' },
    {
        title: 'Hành động',
        key: 'action',
        width: 120,
        customRender: () => '✏️ 🗑️'
    }
]

const newsCategoryData = ref([
    { id: 1, stt: 1, name: 'Thông báo nội bộ', created_by: 'Nguyễn Văn A' },
    { id: 2, stt: 2, name: 'Tuyển dụng', created_by: 'Trần Thị B' },
    { id: 3, stt: 3, name: 'Tin khẩn', created_by: 'Phạm Văn C' },
])

const permissionColumns = [
    { title: 'Stt', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên người dùng', dataIndex: 'user', key: 'user' },
    { title: 'Danh mục liên quan', dataIndex: 'modules', key: 'modules' },
    {
        title: 'Thao tác',
        key: 'action',
        width: 120,
        customRender: () => '🔍 🛠️'
    }
]

const permissionData = ref([
    { id: 1, stt: 1, user: 'Nguyễn Văn A', modules: 'Hạng mục bảng tin, Người dùng' },
    { id: 2, stt: 2, user: 'Lê Thị B', modules: 'Phân quyền, Nhật ký hoạt động' },
    { id: 3, stt: 3, user: 'Trần Văn C', modules: 'Dashboard, Báo cáo' },
])
</script>
