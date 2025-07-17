<template>
  <a-card style="margin-bottom: 16px">
    <a-form :layout="formLayout" :style="formStyle">
      <a-form-item label="Tên người dùng">
        <a-input v-model:value="name" @change="handleChange" placeholder="Nhập tên" />
      </a-form-item>

      <a-form-item label="Phòng ban">
        <a-select v-model:value="department" show-search allow-clear placeholder="Chọn phòng ban"
          :options="departments.map(d => ({ label: d.name, value: d.id }))" @change="handleChange" />
      </a-form-item>

      <a-form-item label="Chức vụ">
        <a-select v-model:value="position" show-search allow-clear placeholder="Chọn chức vụ"
          :options="positions.map(p => ({ label: p.name, value: p.id }))" @change="handleChange" />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import positionService from '@/services/positionSerivce'
import departmentService from '@/services/departmentService'

const emit = defineEmits(['filter'])

const positions = ref([])
const departments = ref([])
const name = ref(null)
const department = ref(null)
const position = ref(null)

const isMobile = ref(false)
const formLayout = computed(() => (isMobile.value ? 'vertical' : 'inline'))
const formStyle = computed(() => (isMobile.value ? { width: '100%' } : {}))

onMounted(async () => {
  const checkMobile = () => (isMobile.value = window.innerWidth < 768)
  checkMobile()
  window.addEventListener('resize', checkMobile)

  try {
    const [posRes, depRes] = await Promise.all([
      positionService.getAll(),
      departmentService.getAll()
    ])
    positions.value = posRes.data
    departments.value = depRes.data
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu tìm kiếm:', err)
  }
})

// Gửi filter lên component cha
const handleChange = () => {
  emit('filter', {
    name: name.value,
    department_id: department.value,
    position_id: position.value
  })
}
</script>