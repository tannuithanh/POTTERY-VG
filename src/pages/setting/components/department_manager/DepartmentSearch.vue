<template>
    <a-card style="margin-bottom: 16px">
        <a-form layout="inline">
            <a-input v-model:value="keyword" placeholder="Nhập tên bộ phận" allow-clear @input="emitSearch" />

        </a-form>
    </a-card>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')

const emit = defineEmits(['search'])

const emitSearch = () => {
    emit('search', keyword.value.trim())
}
</script>
