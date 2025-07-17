<template>
    <DepartmentSearch @search="handleSearch" />
    <DepartmentTable :departments="filteredDepartments" @refresh="fetchDepartments" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DepartmentSearch from './DepartmentSearch.vue'
import DepartmentTable from './DepartmentTable.vue'
import departmentService from '@/services/departmentService'

const allDepartments = ref([])
const filteredDepartments = ref([])

const fetchDepartments = async () => {
    const res = await departmentService.getAll()
    allDepartments.value = res.data
    filteredDepartments.value = res.data
}

const handleSearch = (keyword) => {
    if (!keyword) {
        filteredDepartments.value = allDepartments.value
    } else {
        filteredDepartments.value = allDepartments.value.filter(dep =>
            dep.name.toLowerCase().includes(keyword.toLowerCase())
        )
    }
}

onMounted(fetchDepartments)
</script>
