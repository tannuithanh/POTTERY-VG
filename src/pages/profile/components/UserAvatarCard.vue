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

console.log(props.user)
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
.text-center {
  text-align: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-overlay:hover {
  background: #c06252;
  color: white;
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
