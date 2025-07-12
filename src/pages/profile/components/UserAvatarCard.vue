<template>
  <div class="avatar-wrapper text-center">
    <a-avatar :size="120" :src="user.avatar" />
    <div class="user-name">{{ user.name }}</div>
    <div class="user-id">Mã NV: {{ user.code }}</div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.text-center {
  text-align: center;
}

.user-name {
  margin-top: 12px;
  font-weight: bold;
  font-size: 18px;
  color: #c06252;
}

.user-id {
  color: #888;
  font-size: 13px;
}
</style>
