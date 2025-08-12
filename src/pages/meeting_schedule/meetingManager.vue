<template>
    <div>
        <!-- FILTERS: gọn & responsive, không màu mè -->
        <div class="mb-3">
            <a-row :gutter="[12, 12]" align="middle">
                <!-- Quick filter group -->
                <a-col :xs="24" :md="16">
                    <div class="filter-label">Xem theo</div>
                    <a-radio-group class="w-100 mt-6" v-model:value="quickFilter" button-style="solid"
                        @change="onQuickFilterChange">
                        <a-radio-button value="custom">Tùy chọn</a-radio-button>
                        <a-radio-button value="today">Hôm nay</a-radio-button>
                        <a-radio-button value="this_week">Tuần này</a-radio-button>
                        <a-radio-button value="this_month">Tháng này</a-radio-button>
                        <a-radio-button value="mine">Của tôi</a-radio-button>
                    </a-radio-group>
                </a-col>

                <!-- Toggle combine time when 'mine' -->
                <a-col :xs="24" :md="8" v-if="quickFilter === 'mine'">
                    <div class="filter-label">Tùy chọn thêm</div>
                    <div class="mt-6">
                        <a-checkbox v-model:checked="combineWithDate">Lọc theo thời gian</a-checkbox>
                    </div>
                </a-col>

                <!-- Date pickers block -->
                <a-col :span="24" v-if="showDatePickers">
                    <a-row :gutter="[12, 12]" align="middle">
                        <a-col :xs="24" :md="16">
                            <div class="filter-label">Khoảng thời gian</div>
                            <div class="mt-6 date-row">
                                <a-date-picker v-model:value="fromDate" placeholder="Từ ngày" class="flex-1" />
                                <span class="sep">→</span>
                                <a-date-picker v-model:value="toDate" placeholder="Đến ngày" class="flex-1" />
                            </div>
                        </a-col>
                        <a-col :xs="24" :md="8">
                            <div class="filter-label">&nbsp;</div>
                            <div class="mt-6 actions">
                                <a-space wrap>
                                    <a-button type="primary" @click="filterMeetings">
                                        <template #icon>
                                            <SearchOutlined />
                                        </template>
                                        Tìm kiếm
                                    </a-button>
                                    <a-button @click="resetToNow" :loading="loading">Từ thời điểm hiện tại</a-button>
                                    <!-- Không còn nút Bỏ chọn ngày để tránh tải quá lớn -->
                                </a-space>
                            </div>
                        </a-col>
                    </a-row>
                </a-col>
            </a-row>
        </div>

        <!-- Status: 1 dòng, nói rõ đang lấy theo gì -->
        <a-alert class="mb-3" style="margin-top: 15px;" type="info" :show-icon="true" :message="statusLine" />

        <!-- Title -->
        <h4 class="mb-3">Danh sách lịch họp</h4>

        <!-- Table -->
        <a-table :columns="columns" :dataSource="meetings" :loading="loading" bordered rowKey="id"
            :scroll="{ x: 500 }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'time_date'">
                    {{ formatDate(record.date) }}
                </template>
                <template v-else-if="column.key === 'time_hour'">
                    {{ formatHour(record.start_time) }} → {{ formatHour(record.end_time) }}
                </template>
                <template v-else-if="['related_people', 'specialists', 'advisors'].includes(column.key)">
                    {{ (record[column.key] || []).join(', ') }}
                </template>
                <template v-else-if="column.key === 'attachment_path'">
                    <a v-if="record.attachment_path" :href="record.attachment_path" target="_blank">Tải file</a>
                    <span v-else>Không có</span>
                </template>
                <template v-else-if="column.key === 'actions'">
                    <template v-if="canModify(record)">
                        <a-button type="link" @click="editMeeting(record)">
                            <EditOutlined />
                        </a-button>
                        <a-button type="link" danger @click="deleteMeeting(record)">
                            <DeleteOutlined />
                        </a-button>
                    </template>
                </template>
                <template v-else>
                    {{ record[column.key] }}
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import { ref, onMounted, h, computed, watch } from 'vue';
import { SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { notification, Modal } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import meetingRoomService from '@/services/meeting_schedule_service/meetingService';
import { resolveStoragePath } from '@/utils/storageMeeting';
import { useAuthStore } from '@/stores/auth';

dayjs.extend(isoWeek);

const MAX_RANGE_DAYS = 30; // chặn tải quá lớn

const authentication = useAuthStore();
const currentUser = computed(() => authentication.user || null);
const isAdmin = computed(() => Number(currentUser.value?.is_admin) === 1);
const canModify = (rec) => isAdmin.value || currentUser.value?.id === rec?.created_by_id;

const router = useRouter();

const fromDate = ref(null);
const toDate = ref(null);

// quick filters: custom | today | this_week | this_month | mine
const quickFilter = ref('custom');
const combineWithDate = ref(false);

const meetings = ref([]);
const rawMeetings = ref([]);
const loading = ref(false);

const showDatePickers = computed(() => {
    if (quickFilter.value === 'custom') return true;
    if (quickFilter.value === 'mine') return combineWithDate.value === true;
    return false;
});

// Status line (rất gọn)
const statusLine = computed(() => {
    const modeMap = { custom: 'Tùy chọn', today: 'Hôm nay', this_week: 'Tuần này', this_month: 'Tháng này', mine: 'Của tôi' };
    const parts = [`Chế độ: ${modeMap[quickFilter.value]}`];
    const s = fromDate.value ? dayjs(fromDate.value).format('DD/MM/YYYY') : '—';
    const e = toDate.value ? dayjs(toDate.value).format('DD/MM/YYYY') : `+${MAX_RANGE_DAYS} ngày`;
    parts.push(`Khoảng: ${s} → ${e}`);
    return parts.join(' • ');
});

const columns = [
    { title: 'Phòng họp', dataIndex: 'room', key: 'room', width: 270 },
    {
        title: 'Thời gian', align: 'center', children: [
            { title: 'Ngày', key: 'time_date', width: 100, align: 'center' },
            { title: 'Giờ', key: 'time_hour', width: 250, align: 'center' },
        ]
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
    // Mặc định: lấy từ thời điểm hiện tại → +MAX_RANGE_DAYS
    resetToNow();
    filterMeetings();
});

watch(quickFilter, (val) => {
    applyQuickFilter(val);
});

function resetToNow() {
    fromDate.value = dayjs();
    toDate.value = null; // sẽ được chuẩn hóa thành +MAX_RANGE_DAYS
}

function normalizeRange() {
    let s = fromDate.value ? dayjs(fromDate.value) : null;
    let e = toDate.value ? dayjs(toDate.value) : null;

    if (!s && !e) {
        s = dayjs();
        e = s.add(MAX_RANGE_DAYS, 'day');
    } else if (s && !e) {
        e = dayjs(s).add(MAX_RANGE_DAYS, 'day');
    } else if (!s && e) {
        s = dayjs(e).subtract(MAX_RANGE_DAYS, 'day');
    }

    if (e.isBefore(s)) { const t = s; s = e; e = t; }
    if (e.diff(s, 'day') > MAX_RANGE_DAYS) { e = dayjs(s).add(MAX_RANGE_DAYS, 'day'); }

    fromDate.value = s;
    toDate.value = e;
}

function applyQuickFilter(mode) {
    if (mode === 'today') {
        fromDate.value = dayjs().startOf('day');
        toDate.value = dayjs().endOf('day');
    } else if (mode === 'this_week') {
        fromDate.value = dayjs().startOf('isoWeek');
        toDate.value = dayjs().endOf('isoWeek');
    } else if (mode === 'this_month') {
        fromDate.value = dayjs().startOf('month');
        toDate.value = dayjs().endOf('month');
    } else if (mode === 'mine') {
        if (!combineWithDate.value) {
            fromDate.value = dayjs();
            toDate.value = null; // sẽ được giới hạn +MAX_RANGE_DAYS khi fetch
        }
    }
    filterMeetings();
}

function onQuickFilterChange() {
    applyQuickFilter(quickFilter.value);
}

async function filterMeetings() {
    try {
        loading.value = true;

        // đảm bảo luôn có phạm vi an toàn
        normalizeRange();

        const params = { include_users: true, per_page: 200 };
        if (fromDate.value) params.date_from = dayjs(fromDate.value).format('YYYY-MM-DD');
        if (toDate.value) params.date_to = dayjs(toDate.value).format('YYYY-MM-DD');

        // Bộ lọc "Của tôi" (server-side nếu có):
        // if (quickFilter.value === 'mine') params.created_by_id = currentUser.value?.id;

        const res = await meetingRoomService.list(params);
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.data ?? res?.data ?? [];

        const mapped = (raw || []).map((m) => {
            const dateStr = dayjs(m.start_at).format('YYYY-MM-DD');
            const startTime = dayjs(m.start_at).format('HH:mm');
            const endTime = dayjs(m.end_at).format('HH:mm');
            const fileUrl = m.files?.[0]?.path ? resolveStoragePath(m.files?.[0]?.path) : '';
            const getNames = (arr) => (arr || []).map((u) => u?.name ?? u?.full_name ?? u?.username ?? u?.id).filter(Boolean);
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
                attachment_path: fileUrl || '',
                result_record_location: m.result_location ?? '',
                created_by: m.created_by?.name ?? '',
                created_by_id: m.created_by?.id ?? m.created_by_id ?? m.created_by_user_id ?? m.created_by ?? null,
                created_at: m.created_at ? dayjs(m.created_at).format('YYYY-MM-DD HH:mm') : '',
                _stakeholders_ids: (m.stakeholders || []).map(u => u?.id).filter(Boolean),
                _specialists_ids: (m.specialists || []).map(u => u?.id).filter(Boolean),
                _advisors_ids: (m.advisors || []).map(u => u?.id).filter(Boolean),
                _secretary_id: m.secretary_user_id ?? m.secretary?.id ?? null,
                _decision_maker_id: m.decision_maker?.id ?? null,
            };
        });

        rawMeetings.value = mapped;

        if (quickFilter.value === 'mine') {
            const myId = currentUser.value?.id;
            meetings.value = mapped.filter((rec) => (
                rec.created_by_id === myId ||
                rec._stakeholders_ids?.includes(myId) ||
                rec._specialists_ids?.includes(myId) ||
                rec._advisors_ids?.includes(myId) ||
                rec._secretary_id === myId ||
                rec._decision_maker_id === myId
            ));
        } else {
            meetings.value = mapped;
        }
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

function editMeeting(record) { router.push({ name: 'MeetingEdit', params: { id: record.id } }); }

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

function formatDate(dateStr) { return dayjs(dateStr).format('DD/MM/YYYY'); }
function formatHour(timeStr) { return timeStr; }
</script>

<style scoped>
.filter-label {
    font-size: 12px;
    color: #6b7280;
}

.mt-6 {
    margin-top: 6px;
}

.w-100 {
    width: 100%;
}

.date-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.sep {
    color: #666;
}

.actions {
    display: flex;
    justify-content: flex-start;
}

@media (min-width: 768px) {
    .actions {
        justify-content: flex-end;
    }
}

.table-title {
    font-weight: bold;
    margin-bottom: 16px;
}

.font-medium {
    font-weight: 500;
}
</style>
