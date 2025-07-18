<template>
  <RoleSearch @search="handleSearch" />

  <RoleTable :roles="roles" @edit="openRoleModal" @delete="handleDeleteRole" @select="selectRole"
    @create="openRoleModal" />

  <!-- Chỉ hiển thị PermissionMatrix khi có vai trò được chọn -->
  <PermissionMatrix />

  <RoleModal v-model:visible="showRoleModal" :record="editingRole" @success="fetchRoles" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RoleTable from './RoleTable.vue'
import RoleModal from './RoleModal.vue'
import RoleSearch from './RoleSearch.vue'
import PermissionMatrix from './PermissionMatrix.vue'
import roleService from '@/services/roleService'
import { notification, Modal } from 'ant-design-vue'


const roles = ref([])
const selectedRole = ref(null)
const showRoleModal = ref(false)
const editingRole = ref(null)

const fetchRoles = async (query = {}) => {
  const res = await roleService.getAll(query)
  roles.value = res.data
}

const handleSearch = (query) => fetchRoles(query)

const openRoleModal = (role = null) => {
  editingRole.value = role
  showRoleModal.value = true
}

const handleDeleteRole = (record) => {
  Modal.confirm({
    title: 'Xác nhận xoá',
    content: `Bạn có chắc muốn xoá vai trò "${record.name}"?`,
    okText: 'Xoá',
    okType: 'danger',
    cancelText: 'Huỷ',
    async onOk() {
      try {
        await roleService.delete(record.id)
        fetchRoles()

        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: `Vai trò "${record.name}" đã được xoá thành công.`,
        })
      } catch (err) {
        console.error('Lỗi khi xoá vai trò:', err)

        // Hiển thị thông báo lỗi
        notification.error({
          message: 'Lỗi',
          description: 'Lỗi khi xoá vai trò! Vui lòng thử lại.',
        })
      }
    }
  })
}

const selectRole = (role) => selectedRole.value = role

onMounted(() => fetchRoles())
</script>
