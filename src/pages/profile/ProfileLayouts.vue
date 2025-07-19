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
console.log(authStore)
onMounted(async () => {
  await authStore.fetchMe()
})
</script>
