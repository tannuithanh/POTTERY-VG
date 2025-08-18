<template>
  <a-descriptions bordered :column="1" size="middle"
    :labelStyle="{ width: '200px', color: '#c06252', fontWeight: 'bold' }">
    <a-descriptions-item label="Họ tên">{{ user.name }}</a-descriptions-item>
    <a-descriptions-item label="Email">{{ user.email }}</a-descriptions-item>
    <a-descriptions-item label="Số điện thoại">{{ user.phone }}</a-descriptions-item>
    <a-descriptions-item label="Địa chỉ">{{ user.address }}</a-descriptions-item>
    <a-descriptions-item label="Chức vụ">{{ user.position?.name || '—' }}</a-descriptions-item>
    <a-descriptions-item label="Mô tả công việc">{{ user.position_detail }}</a-descriptions-item>
    <a-descriptions-item label="Phòng ban">{{ user.department?.name || '—' }}</a-descriptions-item>
    <a-descriptions-item label="Quyền hạn">{{ user.is_admin ? 'Quản trị viên' : 'Người dùng thường'
    }}</a-descriptions-item>
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

