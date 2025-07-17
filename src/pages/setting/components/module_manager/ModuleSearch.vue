<template>
    <a-card style="margin-bottom: 16px">
        <a-form layout="inline">
            <a-input v-model:value="keyword" placeholder="Nhập tên module" allow-clear @input="emitSearch" />
        </a-form>
    </a-card>

</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['search'])
const form = reactive({ name: '' })

const onSubmit = () => emit('search', { ...form })
const reset = () => {
    form.name = ''
    emit('search', {})
}
</script>
