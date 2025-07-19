<template>
    <a-card>
        <div class="card-header flex justify-between items-center mb-4">
            <div class="section-title text-lg font-semibold">Danh sách người dùng phân quyền</div>
            <a-button class="addButton" type="primary" @click="openCreateModal">
                + Phân quyền người dùng
            </a-button>
        </div>

        <a-table :dataSource="userRoleList" rowKey="id" bordered>
            <a-table-column title="Vai trò" dataIndex="role_name" key="role_name" />
            <a-table-column title="Tên người dùng" dataIndex="user_name" key="user_name" />
            <a-table-column title="Thao tác" key="action">
                <template #default="{ record }">
                    <TableActionButtons :showView="false" :showEdit="false" :showSave="false" :showCancel="false"
                        :showDelete="true" @delete="handleDelete(record)" />
                </template>
            </a-table-column>

        </a-table>

        <RolePermissionModal v-model:visible="showUserModal" :roles="roles" :users="users" @submit="handleAssign" />
    </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RolePermissionModal from './RolePermissionModal.vue'
import permissionService from '@/services/permissionService'
import { notification, Modal } from 'ant-design-vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

// Props
defineProps({
    roles: Array,
    users: Array
})

const userRoleList = ref([])
const showUserModal = ref(false)

// Gọi khi mở modal
const openCreateModal = () => {
    showUserModal.value = true
}

// Gọi API danh sách
const fetchUserRoles = async () => {
    const res = await permissionService.getAllDataUserRole()
    userRoleList.value = res.data
}

onMounted(fetchUserRoles)

// ✅ Xử lý submit từ Modal
const handleAssign = async (formData) => {
    const { role_id, user_ids } = formData

    try {
        await Promise.all(
            user_ids.map(user_id =>
                permissionService.addUserRole({ role_id, user_id })
            )
        )

        notification.success({ message: 'Thành công', description: 'Phân quyền thành công' })
        showUserModal.value = false
        await fetchUserRoles()
    } catch (err) {
        notification.error({ message: 'Lỗi', description: err?.response?.data?.message })
    }
}

// Delete logic (nếu có)
const handleDelete = (record) => {
  Modal.confirm({
    title: 'Xác nhận xoá phân quyền?',
    content: `Bạn có chắc chắn muốn xoá vai trò "${record.role_name}" khỏi người dùng "${record.user_name}"?`,
    okText: 'Xoá',
    okType: 'danger',
    cancelText: 'Huỷ',
    async onOk() {
      try {
        await permissionService.deleteUserRoll(record.id)
        notification.success({
          message: 'Xoá thành công',
          description: `${record.user_name} đã được gỡ vai trò "${record.role_name}".`
        })
        await fetchUserRoles() // Gọi lại danh sách
      } catch (err) {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể xoá phân quyền.'
        })
      }
    }
  })
}

</script>
