<template>
    <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Tiêu đề bảng tin" name="title" required>
                    <a-input v-model:value="form.title" placeholder="Nhập tiêu đề..." />
                </a-form-item>
                <a-form-item label="Ngày xuất bản" name="publishDate" required>
                    <a-date-picker v-model:value="form.publishDate" style="width: 100%" disabled />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="Danh mục" name="category" required>
                    <a-select v-model:value="form.category" placeholder="Chọn danh mục">
                        <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="Người tạo" name="author">
                    <a-input v-model:value="form.author" disabled />
                </a-form-item>
            </a-col>
        </a-row>

        <a-form-item label="Nội dung" name="content" required>
            <Editor api-key="49ldyxe0mgiev7bgj2mw2vdgu2rrmwfvcht7e9kugd2hf66e" v-model="form.content" :init="{
                height: 400,
                menubar: false,
                plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
                    'image', 'link', 'lists', 'media', 'table', 'visualblocks', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | image link | table'
            }" />
        </a-form-item>

        <a-form-item label="File đính kèm">
            <a-upload v-model:file-list="fileList" list-type="picture-card" :before-upload="() => false"
                :multiple="true" @remove="handleRemoveOld">
                <div>
                    <plus-outlined />
                    <div style="margin-top: 8px">upload file</div>
                </div>
            </a-upload>

        </a-form-item>

        <a-form-item>
            <div style="display: flex; justify-content: center;">
                <a-button type="primary" html-type="submit" :loading="isSubmitting">
                    Cập nhật bảng tin
                </a-button>
            </div>
        </a-form-item>
    </a-form>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Editor from '@tinymce/tinymce-vue'
import { newsCategoryService } from '@/services/news_service/newsCategoryService'
import { newsService } from '@/services/news_service/newsService'
import dayjs from 'dayjs'
import { notification } from 'ant-design-vue'
import { resolveStoragePath } from '@/utils/storageNews'


const route = useRoute()
const router = useRouter()
const id = route.params.id

const isSubmitting = ref(false)

const form = ref({
    title: '',
    publishDate: dayjs(),
    category: null,
    author: '',
    content: '',
    attachments: [],
})

const categories = ref([])

const loadCategories = async () => {
    try {
        const res = await newsCategoryService.getMine()
        categories.value = res.data.data
    } catch (error) {
        console.error('Lỗi tải danh mục:', error)
    }
}
const oldAttachments = ref([])
const loadNewsDetail = async () => {
    try {
        const res = await newsService.getById(id)
        const data = res.data.data
        form.value = {
            title: data.title,
            publishDate: dayjs(data.published_at),
            category: data.category_id,
            author: data.creator?.name || 'Không rõ',
            content: data.content || '',
            attachments: [], // nếu muốn xử lý preview file cũ thì bạn cần convert url → file list
        }
        oldAttachments.value = data.attachments || []
    } catch (error) {
        notification.error({
            message: 'Lỗi tải dữ liệu',
            description: error.response?.data?.message || 'Không lấy được thông tin bảng tin!',
        })
    }
}

const fileList = ref([])

// Map file cũ vào upload preview
const mapOldAttachmentsToFileList = () => {
    fileList.value = oldAttachments.value.map((url, index) => ({
        uid: `old-${index}`,
        name: url.split('/').pop(),
        status: 'done',
        url: resolveStoragePath(url), // ✅ chuyển thành URL đầy đủ để preview
    }))
}


onMounted(() => {
    loadCategories()
    loadNewsDetail().then(mapOldAttachmentsToFileList)
})

const handleSubmit = async () => {
    const formData = new FormData()

    formData.append('title', form.value.title)
    formData.append('category_id', form.value.category)
    formData.append('published_at', form.value.publishDate.format('YYYY-MM-DD'))
    formData.append('content', form.value.content)

    // ✅ Gửi file cũ còn giữ (dựa trên fileList thực tế)
    fileList.value.forEach(file => {
        if (!file.originFileObj && file.url) {
            formData.append('old_attachments[]', file.url)
        }
    })

    // ✅ Gửi file mới
    fileList.value.forEach(file => {
        if (file.originFileObj) {
            formData.append('attachments[]', file.originFileObj)
        }
    })

    await newsService.update(id, formData)
    notification.success({ message: 'Cập nhật thành công' })
    router.push('/news_list_manager')
}


const handleRemoveOld = (file) => {
    // Nếu là file cũ (status: done, không có originFileObj)
    if (!file.originFileObj && file.url) {
        oldAttachments.value = oldAttachments.value.filter((url) => url !== file.url)
    }
}
</script>
