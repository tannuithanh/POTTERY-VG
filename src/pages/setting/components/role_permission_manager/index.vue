<template>
  <RoleSearch @search="handleSearch" />

  <RoleTable
    :roles="roles"
    @edit="openRoleModal"
    @delete="handleDeleteRole"
    @select="selectRole"
    @create="openRoleModal"
  />

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

const handleDeleteRole = async (id) => {
  await roleService.delete(id)
  fetchRoles()
}

const selectRole = (role) => selectedRole.value = role

onMounted(() => fetchRoles())
</script>
