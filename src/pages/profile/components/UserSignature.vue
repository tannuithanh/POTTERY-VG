<template>
    <a-card title="Chữ ký số cá nhân" :bordered="true" :headStyle="{ color: '#c06252', fontWeight: 'bold' }"
        :bodyStyle="{ textAlign: 'center', padding: '12px 16px' }">
        <img :src="signature" alt="Chữ ký số"  />
    </a-card>
</template>

<script setup>
defineProps({
    signature: {
        type: String,
        required: true
    }
})
</script>
