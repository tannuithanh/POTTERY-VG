<template>
  <a-card style="margin-bottom: 16px">
    <a-form :layout="formLayout" :style="formStyle">
      <a-form-item label="Tên người dùng">
        <a-select show-search allow-clear placeholder="Chọn người dùng" style="width: 100%">
          <a-select-option v-for="n in names" :key="n" :value="n">{{ n }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Phòng ban">
        <a-select show-search allow-clear placeholder="Chọn phòng ban" style="width: 100%">
          <a-select-option v-for="d in departments" :key="d" :value="d">{{ d }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Chức vụ">
        <a-select show-search allow-clear placeholder="Chọn chức vụ" style="width: 100%">
          <a-select-option v-for="p in positions" :key="p" :value="p">{{ p }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const names = ['Nguyễn Văn A', 'Trần Thị B']
const departments = ['Kinh doanh', 'Nhân sự']
const positions = ['Trưởng phòng', 'Nhân viên']

const isMobile = ref(false)
const formLayout = computed(() => (isMobile.value ? 'vertical' : 'inline'))
const formStyle = computed(() => (isMobile.value ? { width: '100%' } : {}))

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>
