<template>
  <div class="avatar-wrapper text-center">
    <div class="avatar-container">
      <a-spin :spinning="uploading" size="large">
        <a-avatar :size="120" :src="avatar" />
        <label class="avatar-overlay">
          <input type="file" accept="image/*" @change="onAvatarChange" hidden />
          <EditOutlined />
        </label>
      </a-spin>
    </div>

    <div class="user-name">{{ user.name }}</div>
    <div class="user-id">Mã NV: {{ user.msnv }}</div>
  </div>
</template>

<script setup>
import { EditOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { resolveStoragePath } from '@/utils/storage'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})
const avatar = computed(() => resolveStoragePath(props.user.avatar))

const authStore = useAuthStore()
const uploading = ref(false)

async function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return

  uploading.value = true

  const result = await authStore.uploadAvatar(file)

  uploading.value = false

  if (result.success) {
    notification.success({
      message: 'Thành công',
      description: 'Cập nhật ảnh đại diện thành công'
    })
  } else {
    notification.error({
      message: 'Lỗi',
      description: result.error
    })
  }
}
</script>

<style scoped>
:root {
  --brand: #c06252;
}

/* căn giữa tổng thể */
.text-center {
  text-align: center;
}

/* khung avatar */
.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: transform .25s ease, filter .25s ease;
  will-change: transform;
}

.avatar-container:hover {
  transform: translateY(-2px);
}

/* nâng cấp avatar: viền trắng + vòng ngoài màu thương hiệu + bóng mềm */
.avatar-container :deep(.ant-avatar) {
  border-radius: 999px !important;
  box-shadow:
    0 8px 20px rgba(192, 98, 82, .16),
    0 0 0 3px #fff,
    0 0 0 6px rgba(192, 98, 82, .20);
  background: #fff;
}

/* nút overlay (sửa ảnh) kiểu fab mini */
.avatar-overlay {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(9, 11, 16, .75);
  color: #fff;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, .25);
  transition: transform .2s ease, background-color .2s ease, box-shadow .2s ease, color .2s ease;
  z-index: 2;
}

.avatar-overlay:hover {
  background: var(--brand);
  color: #fff;
  transform: scale(1.06);
  box-shadow: 0 6px 16px rgba(192, 98, 82, .35);
}

/* khi đang upload thì vô hiệu hoá hover nhẹ */
:deep(.ant-spin-nested-loading) {
  display: inline-block;
}

/* tên & mã NV */
.user-name {
  margin-top: 12px;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: .2px;
  color: var(--brand);
}

.user-id {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
}
</style>
