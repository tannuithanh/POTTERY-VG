<template>
    <div class="login-wrapper">
        <a-card class="login-card" :bordered="false">
            <img src="@/assets/images/logo.png" alt="Logo" class="logo" />

            <div class="title">🔐 Đặt lại mật khẩu</div>

            <a-form layout="vertical" @submit.prevent="handleSubmit">
                <a-form-item name="password">
                    <a-input-password v-model:value="form.password" placeholder="Mật khẩu mới" size="large"
                        allow-clear />
                </a-form-item>

                <a-form-item name="password_confirmation">
                    <a-input-password v-model:value="form.password_confirmation" placeholder="Xác nhận mật khẩu"
                        size="large" allow-clear />
                </a-form-item>

                <a-button type="primary" html-type="submit" block :loading="loading" size="large">
                    Xác nhận thay đổi
                </a-button>
            </a-form>

            <div class="text-center mt-5" style="margin-top: 30px;">
                <router-link to="/login" class="back-link">
                    ← Quay lại đăng nhập
                </router-link>
            </div>
        </a-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Lấy token và email từ URL
const token = route.query.token
const email = route.query.email

const form = reactive({
    password: '',
    password_confirmation: ''
})
const loading = ref(false)

const handleSubmit = async () => {
    if (!form.password || !form.password_confirmation) {
        return notification.error({
            message: 'Lỗi',
            description: 'Vui lòng nhập đầy đủ thông tin',
        })
    }

    if (form.password.length < 8) {
        return notification.error({
            message: 'Lỗi',
            description: 'Mật khẩu phải có ít nhất 8 ký tự',
        })
    }

    if (form.password !== form.password_confirmation) {
        return notification.error({
            message: 'Lỗi',
            description: 'Mật khẩu không khớp',
        })
    }

    loading.value = true
    try {
        const res = await auth.resetPassword({
            token,
            email,
            password: form.password,
            password_confirmation: form.password_confirmation,
        })

        if (res.success) {
            notification.success({
                message: 'Thành công',
                description: res.message,
            })
            router.push('/login')
        } else {
            notification.error({
                message: 'Lỗi',
                description: res.message,
            })
        }
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.',
        })
    } finally {
        loading.value = false
    }
}

</script>


<style scoped>
.login-wrapper {
    height: 100vh;
    width: 100vw;
    background-image: url('@/assets/images/Login.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    overflow: hidden;
}

.login-card {
    width: 100%;
    max-width: 400px;
    padding: 32px 24px;
    border-radius: 16px;
    text-align: center;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.title {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 24px;
    color: #000000;
    text-transform: uppercase;
}

.back-link {
    font-size: 13px;
    color: #888;
    text-decoration: none;
    transition: color 0.3s ease;
}

.back-link:hover {
    color: #c06252;
}

.logo {
    width: 100px;
    margin: 0 auto 8px;
}
</style>
