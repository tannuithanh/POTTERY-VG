<template>
    <div class="login-wrapper">
        <a-card class="login-card" :bordered="false">
            <!-- Logo -->
            <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
            <div class="title">HỆ THỐNG PORTAL VINH GIA</div>

            <!-- Form -->
            <a-form :model="form" :rules="rules" layout="vertical" @submit.prevent="handleLogin">
                <a-form-item name="email">
                    <a-input v-model:value="form.email" placeholder="Email đăng nhập" size="middle" />
                </a-form-item>

                <a-form-item name="password">
                    <a-input-password v-model:value="form.password" placeholder="Mật khẩu" size="middle" />
                </a-form-item>

                <a-form-item class="mb-1">
                    <a-button type="primary" html-type="submit" block :loading="loading" size="middle">
                        Đăng nhập
                    </a-button>
                </a-form-item>
            </a-form>

            <!-- Links -->
            <div class="text-center mt-2">
                <a style="color: #c06252;" class="text-xs ">Quên mật khẩu?</a>
            </div>
        </a-card>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { notification } from 'ant-design-vue'


const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
    email: '',
    password: ''
})

const rules = {
    email: [{ required: true, message: 'Vui lòng nhập email', trigger: 'blur' }],
    password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}

const loading = ref(false)

const handleLogin = async () => {
  // Kiểm tra email
  if (!form.email) {
    return notification.error({
      message: 'Lỗi đăng nhập',
      description: 'Vui lòng nhập email'
    })
  }
  if (!form.email.includes('@')) {
    return notification.error({
      message: 'Lỗi đăng nhập',
      description: 'Email không hợp lệ'
    })
  }

  // Kiểm tra mật khẩu
  if (!form.password) {
    return notification.error({
      message: 'Lỗi đăng nhập',
      description: 'Vui lòng nhập mật khẩu'
    })
  }

  try {
    loading.value = true
    await authStore.login(form)
    notification.success({
      message: 'Thành công',
      description: 'Đăng nhập thành công'
    })
    router.push('/')
  } catch (error) {
    notification.error({
      message: 'Đăng nhập thất bại',
      description: error?.response?.data?.message || 'Vui lòng kiểm tra lại'
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
    /* xóa padding nếu không cần */
    overflow: hidden;
    /* không cho tràn */
}

.login-card {
    width: 100%;
    max-width: 400px;
    padding: 24px;
    border-radius: 16px;
    text-align: center;
    background-color: #ffffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.logo {
    width: 100px;
    margin: 0 auto 8px;
}

.title {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 20px;
    color: #333;
}
</style>
