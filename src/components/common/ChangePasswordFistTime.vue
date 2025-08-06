<template>
    <a-form :model="formState" :rules="rules" layout="vertical" @finish="handleSubmit" class="password-change-form">
        <a-form-item label="Mật khẩu mới" name="password">
            <a-input-password v-model:value="formState.password" placeholder="Nhập mật khẩu mới" />
        </a-form-item>

        <a-form-item label="Xác nhận mật khẩu" name="password_confirmation">
            <a-input-password v-model:value="formState.password_confirmation" placeholder="Nhập lại mật khẩu" />
        </a-form-item>

        <a-form-item>
            <a-button type="primary" html-type="submit" block>
                Đổi mật khẩu
            </a-button>
        </a-form-item>
    </a-form>
</template>

<script setup>
import { reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['success']);
const auth = useAuthStore();

const formState = reactive({
    password: '',
    password_confirmation: '',
});

const rules = {
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự', trigger: 'blur' },
    ],
    password_confirmation: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
        {
            validator: (_, value) => {
                if (value !== formState.password) {
                    return Promise.reject('Mật khẩu xác nhận không khớp');
                }
                return Promise.resolve();
            },
            trigger: 'blur',
        },
    ],
};

const handleSubmit = async () => {
    try {
        await auth.changePasswordFistTime({
            password: formState.password,
            password_confirmation: formState.password_confirmation,
        });
        message.success('Đổi mật khẩu thành công');
        emit('success');
    } catch (err) {
        console.error(err);
        message.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
};
</script>
