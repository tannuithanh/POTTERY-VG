<template>
    <UserSearch @filter="handleFilter" />
    <UserTable :users="users" :currentUserId="currentUserId"  @refresh="fetchUsers" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserTable from './UserTable.vue'
import UserSearch from './UserSearch.vue'
import userService from '@/services/userService'

const allUsers = ref([])
const users = ref([])
const currentUserId = ref(null)


const fetchUsers = async () => {
    try {
        const res = await userService.getAll()
        allUsers.value = res.data
        users.value = res.data
    } catch (err) {
        console.error('Lỗi khi tải người dùng:', err)
    }
}

onMounted(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'))
    currentUserId.value = currentUser?.id || null
    fetchUsers()
})

const handleFilter = (filter) => {
    if (!filter.name && !filter.department_id && !filter.position_id) {
        users.value = allUsers.value
        return
    }

    users.value = allUsers.value.filter(u => {
        return (!filter.name || u.name?.toLowerCase().includes(filter.name.toLowerCase())) &&
            (!filter.department_id || u.department_id === filter.department_id) &&
            (!filter.position_id || u.position_id === filter.position_id)
    })
}

</script>
