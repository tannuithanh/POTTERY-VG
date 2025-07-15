<template>
    <a-form layout="vertical" :model="form" @finish="handleSubmit">
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Tiêu đề bảng tin" name="title" required>
                    <a-input v-model:value="form.title" placeholder="Nhập tiêu đề..." />
                </a-form-item>

                <a-form-item label="Ngày xuất bản" name="publishDate" required>
                    <a-date-picker v-model:value="form.publishDate" style="width: 100%" show-time disabled />
                </a-form-item>
            </a-col>

            <a-col :span="12">
                <a-form-item label="Danh mục" name="category" required>
                    <a-select v-model:value="form.category" placeholder="Chọn danh mục">
                        <a-select-option value="announcement">THÔNG BÁO - TIN TỨC</a-select-option>
                        <a-select-option value="event">SỰ KIỆN</a-select-option>
                        <a-select-option value="internal">NỘI BỘ</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Người tạo" name="author">
                    <a-input v-model:value="form.author" disabled />
                </a-form-item>
            </a-col>
        </a-row>

        <a-form-item label="Nội dung" name="content" required>
            <main id="sample">
                <editor id="uuid" apiKey="9jugh9qhxyyoboxxz61jtvqzkphb5t4s9xu8qa6njnehuspu" :init="{
                    plugins: 'advlist anchor autolink charmap code fullscreen help image insertdatetime link lists media preview searchreplace table visualblocks wordcount',
                    toolbar: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                    height: 500,
                }" />
            </main>
        </a-form-item>

        <a-form-item label="File đính kèm (có thể chọn nhiều)">
            <a-upload v-model:file-list="form.attachments" :multiple="true" :before-upload="() => false"
                list-type="text">
                <a-button>Choose Files</a-button>
            </a-upload>
        </a-form-item>

        <a-form-item>
            <div style="display: flex; justify-content: center;">
                <a-button type="primary" html-type="submit">Tạo bảng tin</a-button>
            </div>
        </a-form-item>

    </a-form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Editor from '@tinymce/tinymce-vue';
import dayjs from 'dayjs'
const form = ref({
    title: '',
    category: '',
    publishDate: dayjs(),
    author: 'Administrator',
    content: '',
    attachments: [],
});

const handleSubmit = () => {
    console.log('Submitted:', form.value);
    // Gọi API tại đây
};



</script>
