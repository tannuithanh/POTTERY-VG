<template>
    <a-modal v-model:visible="visible" title="Đổi mật khẩu" @ok="handleOk" @cancel="handleCancel"
        :confirm-loading="loading" ok-text="Xác nhận" cancel-text="Hủy">
        <a-form :model="form" :rules="rules" ref="formRef" layout="vertical">
            <a-form-item label="Mật khẩu cũ" name="currentPassword">
                <a-input-password v-model:value="form.currentPassword" />
            </a-form-item>

            <a-form-item label="Mật khẩu mới" name="newPassword">
                <a-input-password v-model:value="form.newPassword" />
            </a-form-item>

            <a-form-item label="Nhập lại mật khẩu mới" name="confirmPassword">
                <a-input-password v-model:value="form.confirmPassword" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const props = defineProps({
    open: Boolean
})
const emit = defineEmits(['update:open'])

const visible = ref(false)
watch(() => props.open, val => {
    visible.value = val
})

const loading = ref(false)
const formRef = ref()

const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const rules = {
    currentPassword: [{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }],
    newPassword: [{ required: true, message: 'Vui lòng nhập mật khẩu mới' }],
    confirmPassword: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
        {
            validator: (_, value) => {
                if (!value || value === form.newPassword) return Promise.resolve()
                return Promise.reject('Mật khẩu xác nhận không khớp')
            }
        }
    ]
}

const handleOk = async () => {
    formRef.value.validate().then(async () => {
        loading.value = true
        try {
            await authStore.changePassword({
                current_password: form.currentPassword,
                new_password: form.newPassword,
                new_password_confirmation: form.confirmPassword
            })

            message.success('Đổi mật khẩu thành công!')
            emit('update:open', false)

            // reset form
            form.currentPassword = ''
            form.newPassword = ''
            form.confirmPassword = ''
        } catch (error) {
            const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại'
            message.error(msg)
        } finally {
            loading.value = false
        }
    }).catch(() => { })
}


const handleCancel = () => {
    emit('update:open', false)
}
</script>
