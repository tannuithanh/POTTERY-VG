<template>
    <div>
        <!-- Bộ lọc ngày -->
        <a-space class="mb-4" direction="horizontal">
            <a-date-picker v-model:value="fromDate" placeholder="Từ ngày" />
            <span>→</span>
            <a-date-picker v-model:value="toDate" placeholder="Đến ngày" />
            <a-button type="primary" @click="filterMeetings">
                <template #icon>
                    <SearchOutlined />
                </template>
                Tìm kiếm
            </a-button>
        </a-space>

        <!-- Tiêu đề -->
        <h4 class="mb-3">Danh sách lịch họp</h4>

        <!-- Bảng danh sách -->
        <a-table :columns="columns" :dataSource="meetings" :loading="loading" bordered rowKey="id"
            :scroll="{ x: 2000 }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'time_date'">
                    {{ formatDate(record.date) }}
                </template>

                <template v-else-if="column.key === 'time_hour'">
                    {{ formatHour(record.start_time) }} → {{ formatHour(record.end_time) }}
                </template>

                <template v-else-if="
                    column.key === 'related_people' ||
                    column.key === 'specialists' ||
                    column.key === 'advisors'
                ">
                    {{ (record[column.key] || []).join(', ') }}
                </template>

                <!-- CHỈ 1 FILE -->
                <template v-else-if="column.key === 'attachment_path'">
                    <a v-if="record.attachment_path" :href="record.attachment_path" target="_blank">Tải file</a>
                    <span v-else>Không có</span>
                </template>

                <template v-else-if="column.key === 'actions'">
                    <a-button type="link" @click="editMeeting(record)">
                        <EditOutlined />
                    </a-button>
                    <a-button v-if="isAdmin" type="link" danger @click="deleteMeeting(record)">
                        <DeleteOutlined />
                    </a-button>
                </template>

                <template v-else>
                    {{ record[column.key] }}
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import { SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { notification, Modal } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import meetingRoomService from '@/services/meeting_schedule_service/meetingService';
import { resolveStoragePath } from '@/utils/storageMeeting';

const router = useRouter();

const fromDate = ref(null);
const toDate = ref(null);

const meetings = ref([]);
const loading = ref(false);
const isAdmin = true;

const columns = [
    { title: 'Phòng họp', dataIndex: 'room', key: 'room', width: 270 },
    {
        title: 'Thời gian', // header cha
        align: 'center',    // canh giữa luôn cả header cha
        children: [
            { title: 'Ngày', key: 'time_date', width: 100, align: 'center' },
            { title: 'Giờ', key: 'time_hour', width: 250, align: 'center' },
        ],
    },
    { title: 'Nội dung', dataIndex: 'title', key: 'title', width: 300 },
    { title: 'Chủ trì', dataIndex: 'moderator', key: 'moderator', width: 200 },
    { title: 'Người liên quan', key: 'related_people', width: 300 },
    { title: 'Thiết bị', dataIndex: 'devices', key: 'devices', width: 200 },
    { title: 'Thành phần chuyên môn', key: 'specialists', width: 300 },
    { title: 'Thành phần tư vấn', key: 'advisors', width: 200 },
    { title: 'Người quyết định', dataIndex: 'decision_maker', key: 'decision_maker', width: 200 },
    { title: 'Thư ký', dataIndex: 'secretary', key: 'secretary', width: 200 },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 250 },
    { title: 'Tệp đính kèm', key: 'attachment_path', width: 200 },
    { title: 'Nơi ghi nhận', dataIndex: 'result_record_location', key: 'result_record_location', width: 250 },
    { title: 'Người tạo', dataIndex: 'created_by', key: 'created_by', width: 200 },
    { title: 'Tạo lúc', dataIndex: 'created_at', key: 'created_at', width: 200 },
    { title: 'Thao tác', key: 'actions', width: 100 },
];

onMounted(() => {
    fromDate.value = dayjs();
    toDate.value = dayjs();
    filterMeetings();
});

async function filterMeetings() {
    try {
        loading.value = true;

        const params = { include_users: true, per_page: 200 };
        if (fromDate.value) params.date_from = dayjs(fromDate.value).format('YYYY-MM-DD');
        if (toDate.value) params.date_to = dayjs(toDate.value).format('YYYY-MM-DD');

        const res = await meetingRoomService.list(params);

        // paginator hoặc array
        const raw =
            Array.isArray(res?.data) ? res.data :
                Array.isArray(res) ? res :
                    res?.data?.data ?? res?.data ?? [];

        meetings.value = (raw || []).map((m) => {
            const dateStr = dayjs(m.start_at).format('YYYY-MM-DD');
            const startTime = dayjs(m.start_at).format('HH:mm');
            const endTime = dayjs(m.end_at).format('HH:mm');
            const fileUrl = m.files?.[0]?.path ? resolveStoragePath(m.files?.[0]?.path) : '';

            const getNames = (arr) =>
                (arr || [])
                    .map((u) => u?.name ?? u?.full_name ?? u?.username ?? u?.id)
                    .filter(Boolean);

            return {

                id: m.id,
                room: m.room?.name ?? '',
                date: dateStr,
                start_time: startTime,
                end_time: endTime,
                title: m.title,
                moderator: m.chairperson_name ?? '',
                related_people: getNames(m.stakeholders),
                devices: Array.isArray(m.room_devices) ? m.room_devices.join(', ') : (m.room_devices ?? ''),
                specialists: getNames(m.specialists),
                advisors: getNames(m.advisors),
                decision_maker: m.decision_maker?.name ?? m.decision_maker?.id ?? '',
                secretary: m.secretary?.name ?? m.secretary_user_id ?? '',
                note: m.notes ?? '',
                // ✅ chỉ 1 file: ưu tiên m.file.url, fallback m.files[0].url
                attachment_path: fileUrl || '',
                result_record_location: m.result_location ?? '',
                created_by: m.created_by?.name ?? '',
                created_at: m.created_at ? dayjs(m.created_at).format('YYYY-MM-DD HH:mm') : '',
            };
        });
    } catch (e) {
        console.error(e);
        notification.error({
            message: 'Lỗi tải danh sách',
            description: e?.response?.data?.message || e?.message || 'Không tải được lịch họp',
        });
    } finally {
        loading.value = false;
    }
}

function editMeeting(record) {
    router.push({ name: 'MeetingEdit', params: { id: record.id } });
}

function deleteMeeting(record) {
    Modal.confirm({
        title: 'Xác nhận xóa lịch họp',
        icon: h(ExclamationCircleOutlined),
        content: `Bạn có chắc muốn xóa lịch họp "${record.title}"?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        async onOk() {
            try {
                await meetingRoomService.destroy(record.id);
                notification.success({ message: 'Đã xóa thành công' });
                filterMeetings();
            } catch (e) {
                notification.error({
                    message: 'Xóa thất bại',
                    description: e?.response?.data?.message || e?.message || 'Không thể xóa lịch họp',
                });
            }
        },
    });
}

function formatDate(dateStr) {
    return dayjs(dateStr).format('DD/MM/YYYY');
}

function formatHour(timeStr) {
    return timeStr;
}
</script>

<style scoped>
.table-title {
    font-weight: bold;
    margin-bottom: 16px;
}
</style>
