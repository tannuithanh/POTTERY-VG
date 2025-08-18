<template>
  <div v-if="authStore.user" class="user-profile-wrapper">
    <div class="section-title">THÔNG TIN NGƯỜI DÙNG</div>
    <a-row :gutter="[16, 16]">
      <a-col :span="24" :md="6">
        <UserAvatarCard :user="authStore.user" />
      </a-col>

      <a-col :span="24" :md="18">
        <UserDetailTable :user="authStore.user" />
      </a-col>

      <a-col :span="24">
        <UserSignature :signature="authStore.user.signature" />
      </a-col>
    </a-row>
  </div>

  <div v-else>Đang tải thông tin người dùng...</div>
</template>

<script setup>
import UserAvatarCard from './components/UserAvatarCard.vue'
import UserDetailTable from './components/UserDetailTable.vue'
import UserSignature from './components/UserSignature.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()
onMounted(async () => {
  await authStore.fetchMe()
})
</script>

<style scoped>
:root {
  --brand: #c06252;
  --line: #efe3e0;
  --zebra: #fff9f7;
}

/* bo tròn & màu viền */
:deep(.ant-descriptions) {
  font-size: 14px;
}

:deep(.ant-descriptions-bordered) {
  border-color: var(--line);
  border-radius: 12px;
  overflow: hidden;
}

/* label cell: nền rất nhẹ theo brand */
:deep(.ant-descriptions-bordered .ant-descriptions-item-label) {
  background: linear-gradient(180deg, #fff, #fff7f4);
  color: #8d3f33;
  font-weight: 700;
  width: 220px;
  /* khớp với inline của bạn */
  border-color: var(--line) !important;
  padding: 12px 16px !important;
}

/* content cell */
:deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  background: #fff;
  border-color: var(--line) !important;
  padding: 12px 16px !important;
  color: #2b2b2b;
}

/* zebra theo hàng cho dễ đọc */
:deep(.ant-descriptions-bordered .ant-descriptions-row:nth-child(odd) td) {
  background: var(--zebra);
}

/* tiêu đề nếu dùng <a-descriptions title> (không dùng cũng không sao) */
:deep(.ant-descriptions-title) {
  font-weight: 800;
  color: var(--brand);
}

/* responsive nhỏ: co label */
@media (max-width: 768px) {
  :deep(.ant-descriptions-bordered .ant-descriptions-item-label) {
    width: 160px;
  }
}
</style>
