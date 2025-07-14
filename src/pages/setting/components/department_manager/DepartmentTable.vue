<template>
    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách người dùng</div>
            <a-button class="addButton" @click="showModal = true">
                + Thêm phòng ban
            </a-button>
        </div>
        <a-table :columns="columns" :dataSource="departments" rowKey="id" :pagination="false"
            :scroll="{ x: 'max-content' }" />
    </a-card>
    <!-- MODAL THÊM PHÒNG BAN-->
    <a-modal v-model:open="showModal" title="Thêm bộ phận" :ok-text="okText" cancel-text="Hủy" @ok="handleOk">
        <a-form layout="vertical" :model="formData">
            <a-form-item label="Tên bộ phận" required>
                <a-input v-model:value="formData.name" placeholder="Nhập tên bộ phận" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { h, ref } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

const props = defineProps({
    departments: { type: Array, default: () => [] }
})

const emit = defineEmits(['view', 'edit', 'delete'])

const showModal = ref(false)
const formData = ref({
    name: ''
})

const columns = [
    {
        title: 'STT',
        customRender: ({ index }) => index + 1,
        width: 60
    },
    {
        title: 'Tên bộ phận',
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: 'Thao tác',
        key: 'actions',
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: false,
                onEdit: () => emit('edit', record),
                onDelete: () => emit('delete', record)
            })
    }
]

function handleOk() {
    console.log('Thông tin phòng ban:', formData.value)
    showModal.value = false
    formData.value.name = ''
}
</script>
