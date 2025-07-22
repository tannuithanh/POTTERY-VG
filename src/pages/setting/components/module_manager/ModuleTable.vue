<template>
    <a-card>
        <div class="card-header">
            <div class="section-title">Danh sách chức năng</div>
            <a-button type="primary" @click="$emit('create')">+ Thêm chức năng</a-button>
        </div>
        <a-table :columns="columns" :dataSource="data" rowKey="id" bordered>
            <template #action="{ record }">
                <TableActionButtons :showEdit="true" :showDelete="true" :showView="false" @edit="$emit('edit', record)"
                    @delete="handleDelete(record)" />
            </template>
        </a-table>
    </a-card>
</template>

<script setup>
import TableActionButtons from '@/components/common/TableActionButtons.vue';
import { Modal, notification, message } from 'ant-design-vue'
import { h } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import moduleService from '@/services/moduleService' // nếu bạn đang gọi module API ở đ

const props = defineProps({
    data: Array
})
const emit = defineEmits(['edit', 'delete', 'refresh'])
const columns = [
    {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: 70,
        customRender: ({ index }) => index + 1
    },
    { title: 'Tên Module', dataIndex: 'name' },
    { title: 'Mã Code', dataIndex: 'code' },
    {
        title: 'Hành động',
        key: 'action',
        slots: { customRender: 'action' },
        align: 'center',
        width: 120
    }
]

const handleDelete = (record) => {
    Modal.confirm({
        title: 'Xác nhận xoá',
        icon: h(ExclamationCircleOutlined),
        content: `Bạn có chắc chắn muốn xoá chức năng "${record.name}"?`,
        okText: 'Xoá',
        okButtonProps: { danger: true },
        cancelText: 'Hủy',
        async onOk() {
            try {
                await moduleService.delete(record.id)
                notification.success({ message: 'Xoá thành công' })
                emit('refresh') // 👈 đây mới là cách reload
            } catch (err) {
                message.error(err?.response?.data?.message || 'Lỗi khi xoá chức năng')
            }
        }
    })
}

</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-weight: bold;
    font-size: 16px;
}

.addButton {
    font-weight: 500;
}
</style>