<template>
  <a-descriptions
    bordered
    :column="1"
    size="middle"
    :labelStyle="{ width: '200px', color: '#c06252', fontWeight: 'bold' }"
  >
    <a-descriptions-item label="Họ tên">{{ user.name }}</a-descriptions-item>
    <a-descriptions-item label="Email">{{ user.email }}</a-descriptions-item>
    <a-descriptions-item label="Chức vụ">{{ user.position }}</a-descriptions-item>
    <a-descriptions-item label="Mô tả công việc">{{ user.description }}</a-descriptions-item>
  </a-descriptions>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>
