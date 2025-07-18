<template>
    <a-card>
        <div class="card-header flex justify-between items-center mb-4">
            <div class="section-title text-lg font-semibold">Danh sách người dùng phân quyền</div>
            <a-button class="addButton" type="primary" @click="openCreateModal">+ Phân quyền người dùng</a-button>
        </div>

        <a-table :columns="columns" :dataSource="data" rowKey="id" bordered>
            <template #action="{ record }">
                <TableActionButtons :showEdit="true" :showDelete="true" :showView="false" @edit="$emit('edit', record)"
                    @delete="handleDelete(record)" />
            </template>
        </a-table>
    </a-card>
    <RolePermissionModal v-model:visible="showUserModal" :roles="roles" :users="users" @submit="handleAssign" />
</template>

<script setup>
import { ref } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import RolePermissionModal from './RolePermissionModal.vue'
import { message } from 'ant-design-vue'

// Props
const props = defineProps({
    data: Array,
    roles: Array,
    users: Array
})

// Emits
const emit = defineEmits(['edit', 'delete', 'submit'])

// Columns
// const columns = [
//     {
//         title: 'Người dùng',
//         dataIndex: 'userName',
//         key: 'userName'
//     },
//     {
//         title: 'Vai trò',
//         dataIndex: 'roleName',
//         key: 'roleName'
//     },
//     {
//         title: 'Hành động',
//         key: 'action',
//         slots: { customRender: 'action' }
//     }
// ]

// Modal state
const showUserModal = ref(false)

// Modal logic
const openCreateModal = () => {
    showUserModal.value = true
}

const handleAssign = (formData) => {
    emit('submit', formData)
    showUserModal.value = false
}

// Delete
const handleDelete = (record) => {
    emit('delete', record)
}
</script>
