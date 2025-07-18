<template>
    <RolePermissionTable :data="userRoleList" :roles="allRoles" :users="allUsers" @submit="assignUsersToRole" />

</template>

<script setup>
import { ref } from 'vue'
import RolePermissionTable from './RolePermissionTable.vue'

// Giả sử fetch từ API hoặc đã có
const userRoleList = ref([
  { id: 1, userName: 'Nguyễn Văn A', roleName: 'Quản trị viên' },
  { id: 2, userName: 'Trần Thị B', roleName: 'Nhân viên' }
])

const allRoles = ref([
  { id: 1, name: 'Quản trị viên' },
  { id: 2, name: 'Nhân viên' }
])

const allUsers = ref([
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
  { id: 3, name: 'Phạm Văn C' }
])

const assignUsersToRole = (data) => {
  console.log('Dữ liệu phân quyền:', data)
  // Gọi API phân quyền ở đây
}
</script>
