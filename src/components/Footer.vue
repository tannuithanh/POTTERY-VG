<template>
  <a-layout-footer class="custom-footer-modern">
    <div class="footer-content">
      <span>© {{ new Date().getFullYear() }} Vinh Gia Co., Ltd</span>
      <span class="dot">·</span>
      <span>Thiết kế & phát triển bởi <strong>Phòng CNTT</strong></span>
    </div>
  </a-layout-footer>


  <a-modal v-model:visible="showForceChangePassword" title="Đổi mật khẩu lần đầu" :closable="false"
    :maskClosable="false" :footer="null" width="400px" destroyOnClose>
    <ChangePasswordFistTime @success="handlePasswordChanged" />
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ChangePasswordFistTime from './common/ChangePasswordFistTime.vue';

const auth = useAuthStore();
const showForceChangePassword = ref(false);

// Theo dõi user và kiểm tra trạng thái đổi mật khẩu
watch(
  () => auth.user?.first_time_change_password,
  (val) => {
    showForceChangePassword.value = val === 0 || val === false;
  },
  { immediate: true }
);

// Sau khi đổi mật khẩu thành công
function handlePasswordChanged() {
  showForceChangePassword.value = false;
  auth.user.first_time_change_password = 1; // hoặc true
  // Hoặc gọi lại API getUser nếu cần
}
</script>



<style scoped>
.custom-footer-modern {
  text-align: center;
  padding: 16px 0;
  background: #f9f9f9;
  color: #888;
  font-size: 13px;
  border-top: 1px solid #eee;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  align-items: center;
}

.footer-content strong {
  font-weight: 500;
  color: #555;
}

.footer-content .dot {
  color: #ccc;
}

</style>
