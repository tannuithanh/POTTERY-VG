<template>
    <a-card style="margin-bottom: 16px">
        <a-form layout="inline" @submit.prevent="onSubmit">

            <a-input v-model:value="form.name" placeholder="Nhập tên hoặc mã vai trò" allow-clear @input="onSubmit" />
        </a-form>
    </a-card>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['search'])
const form = reactive({ name: '' })

const onSubmit = () => {
    emit('search', { keyword: form.name }) // 👈 Đặt tên key rõ ràng nếu cần
}

const reset = () => {
    form.name = ''
    emit('search', {})
}
</script>
