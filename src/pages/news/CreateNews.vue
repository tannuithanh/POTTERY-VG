<template>
    <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Tiêu đề bảng tin" name="title" required>
                    <a-input v-model:value="form.title" placeholder="Nhập tiêu đề..." />
                </a-form-item>
                <a-form-item label="Ngày xuất bản" name="publishDate" required>
                    <a-date-picker :disabled-date="disabledBeforeToday" v-model:value="form.publishDate"
                        style="width: 100%" :disabled="true" />
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
            <a-upload v-model:file-list="form.attachments" list-type="picture-card" :before-upload="() => false"
                :multiple="true">
                <div>
                    <plus-outlined />
                    <div style="margin-top: 8px">upload file</div>
                </div>
            </a-upload>
        </a-form-item>


        <a-form-item>
            <div style="display: flex; justify-content: center;">
                <a-button type="primary" html-type="submit" :loading="isSubmitting">
                    Tạo bảng tin
                </a-button>

            </div>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { ref, onMounted,h } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { newsCategoryService } from '@/services/news_service/newsCategoryService'
import { newsService } from '@/services/news_service/newsService'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { Modal, notification, Progress } from 'ant-design-vue'

const isSubmitting = ref(false)
const openProgressModal = () => {
    modalInstance.value = Modal.info({
        title: 'Đang gửi thông báo bảng tin mới đến tất cả người dùng...',
        content: () =>
            h(Progress, {
                percent: progressPercent.value,
                status: 'active',
            }),
        okButtonProps: { disabled: true },
        okText: 'Đang gửi...',
    })
}
const authStore = useAuthStore()

const form = ref({
    title: '',
    publishDate: dayjs(),
    category: null,
    author: authStore.user.name,
    content: '',
    attachments: [],
})

const categories = ref([])

const loadCategories = async () => {
    try {
        const res = await newsCategoryService.getMine()
        categories.value = res.data.data // hoặc `res.data` nếu API trả mảng trực tiếp
    } catch (error) {
        console.error('Lỗi tải danh mục:', error)
    }
}
const disabledBeforeToday = (current) => {
    return current && current < dayjs().startOf('day')
}
onMounted(() => {
    loadCategories()
})
const progressPercent = ref(0)
const modalInstance = ref(null)

const handleSubmit = async () => {
    try {
        openProgressModal()
        isSubmitting.value = true

        // Giả lập hiệu ứng tăng phần trăm (nếu không có backend trả về %)
        progressPercent.value = 10

        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('category_id', form.value.category)
        formData.append('published_at', form.value.publishDate.format('YYYY-MM-DD'))
        formData.append('content', form.value.content)

        form.value.attachments.forEach((file) => {
            formData.append('attachments[]', file.originFileObj)
        })

        progressPercent.value = 30 // giả lập upload file

        const res = await newsService.create(formData)

        progressPercent.value = 80 // gần hoàn thành

        notification.success({
            message: 'Thành công',
            description: res.data.message || 'Tạo bảng tin thành công!',
            duration: 3,
        })

        // Reset form
        form.value = {
            title: '',
            publishDate: dayjs(),
            category: null,
            author: authStore.user.name,
            content: '',
            attachments: [],
        }

        progressPercent.value = 100
    } catch (error) {
        console.error('❌ Lỗi tạo bảng tin:', error)

        notification.error({
            message: 'Lỗi',
            description: error.response?.data?.message || 'Tạo bảng tin thất bại!',
            duration: 4,
        })
    } finally {
        isSubmitting.value = false
        setTimeout(() => {
            if (modalInstance.value) modalInstance.value.destroy()
            progressPercent.value = 0
        }, 1000)
    }
}



</script>