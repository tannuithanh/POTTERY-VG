<template>
    <div>
        <a-card>
            <div class="card-header"
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <div class="section-title">Danh sách phòng họp</div>
                <a-button type="primary" @click="showModal = true">+ Thêm phòng họp</a-button>
            </div>

            <a-table :columns="columns" :dataSource="meetingRooms" rowKey="id" bordered :loading="loading" />

            <!-- Modal thêm phòng họp -->
            <a-modal v-model:visible="showModal" title="Thêm phòng họp mới" @ok="handleAddRoom" ok-text="Lưu"
                cancel-text="Hủy">
                <a-form layout="vertical">
                    <a-form-item label="Tên phòng họp" required>
                        <a-input v-model:value="newRoom.name" placeholder="Nhập tên phòng họp" />
                    </a-form-item>
                </a-form>
            </a-modal>
        </a-card>
    </div>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import dayjs from 'dayjs'
import { message, Modal } from 'ant-design-vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import roomService from '@/services/meeting_schedule_service/roomService'

const showModal = ref(false)
const loading = ref(false)
const meetingRooms = ref([])
const newRoom = ref({ name: '' })
console.log(meetingRooms)
// Load danh sách phòng họp
async function loadRooms() {
    loading.value = true
    try {
        const res = await roomService.getAll()
        meetingRooms.value = res.data.map((room) => ({
            ...room,
            created_by: room.user.name || 'Không rõ',
        }))
    } catch (err) {
        message.error('Lỗi khi tải phòng họp!')
    } finally {
        loading.value = false
    }
}

// Tạo mới
async function handleAddRoom() {
    if (!newRoom.value.name) {
        return message.warning('Vui lòng nhập tên phòng họp')
    }

    try {
        await roomService.create({ name: newRoom.value.name })
        message.success('Đã thêm phòng họp!')
        showModal.value = false
        newRoom.value.name = ''
        await loadRooms()
    } catch (err) {
        message.error('Lỗi khi tạo phòng họp!')
    }
}

// Xoá
function handleDelete(id) {
    Modal.confirm({
        title: 'Xác nhận xoá',
        content: 'Bạn có chắc muốn xoá phòng họp này?',
        okText: 'Xoá',
        cancelText: 'Huỷ',
        okType: 'danger',
        onOk: async () => {
            try {
                await roomService.remove(id)
                message.success('Đã xoá phòng họp')
                await loadRooms()
            } catch (err) {
                message.error('Lỗi khi xoá phòng họp!')
            }
        },
    })
}

// Cột bảng
const columns = [
    {
        title: 'STT',
        key: 'index',
        customRender: ({ index }) => index + 1,
        width: 80,
        align: 'center',
    },
    {
        title: 'Tên phòng họp',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
    },
    {
        title: 'Người tạo',
        dataIndex: 'created_by',
        key: 'created_by',
        align: 'center',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'created_at',
        key: 'created_at',
        customRender: ({ text }) => dayjs(text).format('DD/MM/YYYY'),
        align: 'center',
    },
    {
        title: 'Thao tác',
        key: 'actions',
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: false,
                showEdit: false,
                showSave: false,
                showCancel: false,
                showDelete: true,
                onDelete: () => handleDelete(record.id),
            }),

    },
]

onMounted(() => {
    loadRooms()
})
</script>

<style scoped>
.section-title {
    font-size: 18px;
    font-weight: 600;
}
</style>
