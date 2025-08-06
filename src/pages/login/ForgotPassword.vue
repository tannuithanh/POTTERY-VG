<template>
    <div class="login-wrapper">
        <a-card class="login-card" :bordered="false">
            <!-- Logo nếu muốn giữ -->
            <img src="@/assets/images/logo.png" alt="Logo" class="logo" />

            <div class="title">🔒 Khôi phục mật khẩu</div>

            <a-form :model="form" layout="vertical" @submit.prevent="handleSubmit">
                <a-form-item name="email">
                    <a-input v-model:value="form.email" placeholder="Nhập email" size="large" allow-clear />
                </a-form-item>

                <a-button type="primary" html-type="submit" block :loading="loading" size="large">
                    Gửi liên kết đặt lại mật khẩu
                </a-button>
            </a-form>

            <div class="text-center mt-4">
                <router-link to="/login" class="back-link">← Quay lại đăng nhập</router-link>
            </div>
        </a-card>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { notification } from 'ant-design-vue'

const form = reactive({ email: '' })
const loading = ref(false)

const handleSubmit = async () => {
    if (!form.email) {
        return notification.error({ message: 'Lỗi', description: 'Vui lòng nhập email' })
    }

    loading.value = true
    try {
        // Gửi API gọi reset password ở đây
        // await forgotPasswordAPI(form.email)
        notification.success({
            message: 'Thành công',
            description: 'Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.'
        })
    } catch (error) {
        notification.error({ message: 'Lỗi', description: 'Không gửi được, vui lòng thử lại' })
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
    font-size: 22px;
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
