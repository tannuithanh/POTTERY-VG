<template>
    <a-modal :visible="visible" width="1500px" :footer="null" @cancel="handleClose" :title="null"
        body-style="padding: 24px 32px; max-height: 80vh; overflow-y: auto">
        <h2 style="font-weight: bold; font-size: 20px; margin-bottom: 8px">{{ news?.title }}</h2>
        <div style="display: flex; align-items: center; font-size: 14px; color: #888; margin-bottom: 8px;">
            <span style="margin-right: 12px">
                🗓️ Ngày đăng: {{ formatDate(news?.published_at) }}
            </span>
            <span>🏢 {{ news?.category?.name }}</span>
        </div>

        <div v-html="news?.content" style="margin-top: 16px; font-size: 15px; line-height: 1.6" />

        <div v-if="news?.attachments?.length" style="margin-top: 24px">
            <p style="font-weight: bold; font-size: 16px; margin-bottom: 12px">📎 Tệp đính kèm</p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <div v-for="(file, index) in news.attachments" :key="index"
                    style="width: 160px; text-align: center; background: #f9f9f9; border-radius: 8px; padding: 12px; border: 1px solid #eee">
                    <img :src="isImage(file) ? getFileUrl(file) : getFileIcon(file)" :alt="`file ${index + 1}`"
                        style="width: 100%; height: 100px; object-fit: cover; margin-bottom: 8px; border-radius: 4px" />

                    <div style="font-size: 13px; word-break: break-word;">Tệp {{ index + 1 }}</div>

                    <a v-if="canPreview(file)" href="#" @click.prevent="openPreview(file)"
                        style="display:block;margin-top:6px;font-size:12px;">
                        Xem
                    </a>

                    <!-- Nút Tải xuống (giữ nguyên) -->
                    <a :href="getFileUrl(file)" :download="isImage(file) ? `image_${index + 1}` : null" target="_blank"
                        style="display:block;font-size:12px;">
                        Tải xuống
                    </a>
                </div>
            </div>
        </div>

        <!-- Modal preview -->
        <a-modal v-model:visible="previewVisible" :title="previewTitle" :footer="null" width="90vw"
            :bodyStyle="{ padding: 0, height: '80vh', overflow: 'hidden' }">
            <!-- Ảnh -->
            <div v-if="previewType === 'image'"
                style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000">
                <img :src="previewUrl" alt="preview" style="max-width:100%;max-height:100%;" />
            </div>

            <!-- PDF & Office (iframe) -->
            <iframe v-else-if="previewType === 'pdf' || previewType === 'office'" :src="previewUrl"
                style="border:0;width:100%;height:100%" referrerpolicy="no-referrer" allowfullscreen></iframe>

            <!-- Fallback -->
            <div v-else style="padding:16px">Không hỗ trợ xem trực tiếp tệp này.</div>
        </a-modal>
    </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { resolveStoragePath } from '@/utils/storageNews'

const props = defineProps({
    visible: Boolean,
    news: Object
})
const emit = defineEmits(['update:visible'])

const handleClose = () => emit('update:visible', false)
const getFileUrl = (path) => resolveStoragePath(path)

const isImage = (filePath) => {
    if (!filePath) return false
    const cleanUrl = filePath.split('?')[0]
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(cleanUrl)
}
const isPdf = (filePath) => /\.pdf(\?|$)/i.test(filePath?.split('?')[0] || '')
const isExcel = (p) => /\.(xlsx|xls|xlsm|xltx|xltm|xlsb)(\?|$)/i.test(p?.split('?')[0] || '')
const isWord = (p) => /\.(docx?|rtf)(\?|$)/i.test(p?.split('?')[0] || '')
const isPpt = (p) => /\.(pptx?|ppsx?)(\?|$)/i.test(p?.split('?')[0] || '')
const isOffice = (p) => isExcel(p) || isWord(p) || isPpt(p)
const canPreview = (p) => isImage(p) || isOffice(p)

const getFileIcon = (filePath) => {
    const ext = filePath.split('.').pop().split('?')[0].toLowerCase()
    switch (ext) {
        case 'doc':
        case 'docx': return 'https://cdn-icons-png.flaticon.com/512/281/281760.png'
        case 'xls':
        case 'xlsx': return 'https://cdn-icons-png.flaticon.com/512/732/732220.png'
        case 'pdf': return 'https://cdn-icons-png.flaticon.com/512/337/337946.png'
        case 'ppt':
        case 'pptx': return 'https://cdn-icons-png.flaticon.com/512/136/136545.png'
        case 'zip':
        case 'rar': return 'https://cdn-icons-png.flaticon.com/512/2306/2306184.png'
        default: return 'https://cdn-icons-png.flaticon.com/512/833/833524.png'
    }
}

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`
}

/* --- Preview state --- */
const previewVisible = ref(false)
const previewUrl = ref('')
const previewType = ref('') // image | pdf | office | other
const previewTitle = ref('Xem tệp')

const openPreview = (filePath) => {
    const url = getFileUrl(filePath)

    if (isImage(filePath)) {
        previewType.value = 'image'
        previewUrl.value = url
    } else if (isPdf(filePath)) {
        previewType.value = 'pdf'
        previewUrl.value = url // trình duyệt sẽ render PDF trong iframe
    } else if (isExcel(filePath) || isWord(filePath) || isPpt(filePath)) {
        // Dùng Office Viewer để nhúng xem
        const viewer = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url)
        previewType.value = 'office'
        previewUrl.value = viewer
    } else {
        previewType.value = 'other'
        previewUrl.value = ''
    }

    previewVisible.value = true
}

</script>
