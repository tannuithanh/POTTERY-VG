<template>
  <a-card title="Chữ ký số cá nhân" :bordered="true" :headStyle="{ color: 'white', fontWeight: 'bold' }"
    :bodyStyle="{ textAlign: 'center', padding: '12px 16px' }">
    <!-- Nếu đã có chữ ký -->
    <div v-if="signatureUrl" class="signature-wrapper">
      <img :src="signatureUrl" alt="Chữ ký số" class="signature-img" />
      <label class="upload-overlay">
        <input type="file" accept="image/*" hidden @change="onUpload" />
        <EditOutlined />
      </label>
    </div>

    <!-- Nếu chưa có -->
    <label v-else class="no-signature clickable">
      <input type="file" accept="image/*" hidden @change="onUpload" />
      <PlusOutlined />
      <div class="text">Chưa có chữ ký – Click để tải lên</div>
    </label>
  </a-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { resolveStoragePath } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  signature: { type: String, default: '' }
})

const signatureUrl = computed(() => resolveStoragePath(props.signature))
const authStore = useAuthStore()
const uploading = ref(false)

async function onUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  uploading.value = true
  const result = await authStore.uploadSignature(file) // 👈 bạn cần thêm hàm này trong store

  uploading.value = false

  if (result.success) {
    notification.success({ message: 'Thành công', description: 'Đã cập nhật chữ ký' })
    await authStore.fetchMe() // reload lại user để cập nhật chữ ký
  } else {
    notification.error({ message: 'Lỗi', description: result.error })
  }
}
</script>

<style scoped>
.signature-wrapper {
  position: relative;
  display: inline-block;
}

.signature-img {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.upload-overlay {
  position: absolute;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.no-signature {
  display: inline-block;
  text-align: center;
  color: #999;
}

.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.clickable:hover {
  color: #C06252;
}

.text {
  font-size: 13px;
  margin-top: 6px;
}
</style>
