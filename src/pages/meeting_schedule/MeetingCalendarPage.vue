<template>
    <div>
        <a-space class="mb-3">
            <a-button @click="goToday">Hôm nay</a-button>
            <a-date-picker v-model:value="cursor" picker="month" @change="fetchMonth" />
        </a-space>

        <a-spin :spinning="loading">
            <a-calendar v-model:value="cursor" :fullscreen="true" @panelChange="onPanelChange">
                <template #dateCellRender="{ current }">
                    <div class="px-1">
                        <template v-for="(ev, idx) in visibleEvents(current)" :key="ev.id + '-' + idx">
                            <div class="event-pill" @click.stop="openDetail(ev)">
                                <a-badge :status="badge(ev)" />
                                <span class="line">{{ ev.start.format('HH:mm') }}–{{ ev.end.format('HH:mm') }} · {{
                                    ev.title }}</span>
                            </div>
                        </template>

                        <!-- Xem thêm trong ngày -->
                        <a-button v-if="hiddenCount(current) > 0" type="link" class="more-btn"
                            @click.stop="openDayList(current)">
                            +{{ hiddenCount(current) }} xem thêm
                        </a-button>
                    </div>
                </template>
            </a-calendar>
        </a-spin>

        <!-- Modal: danh sách sự kiện của 1 ngày -->
        <a-modal :visible="dayList.open" :title="`Lịch ngày ${dayList.dateLabel}`" :footer="null"
            @cancel="dayList.open = false" width="720px">
            <div v-if="dayList.open" class="more-wrap">
                <div v-for="ev in dayList.items" :key="ev.id" class="more-item clickable" @click="openDetail(ev)">
                    <a-badge :status="badge(ev)" />
                    <span class="line">{{ ev.start.format('HH:mm') }}–{{ ev.end.format('HH:mm') }} · {{ ev.title
                    }}</span>
                </div>
            </div>
        </a-modal>

        <!-- Modal: chi tiết 1 sự kiện (ĐẦY ĐỦ TRƯỜNG NHƯ BẢNG) -->
        <a-modal :visible="!!detail" :title="detail ? `Chi tiết lịch họp — ${detail.title}` : 'Chi tiết lịch họp'"
            :footer="null" @cancel="detail = null" width="960px" wrapClassName="meeting-detail-modal">
            <template v-if="detail">
                <a-descriptions bordered :column="isMobile ? 1 : 2" size="small">
                    <a-descriptions-item label="Phòng họp">{{ detail.room || '—' }}</a-descriptions-item>

                    <a-descriptions-item label="Ngày">
                        {{ detail.start.format('DD/MM/YYYY') }}
                    </a-descriptions-item>

                    <a-descriptions-item label="Giờ">
                        {{ detail.start.format('HH:mm') }} → {{ detail.end.format('HH:mm') }}
                    </a-descriptions-item>

                    <a-descriptions-item label="Nội dung">{{ detail.title || '—' }}</a-descriptions-item>
                    <a-descriptions-item label="Chủ trì">{{ detail.moderator || '—' }}</a-descriptions-item>

                    <a-descriptions-item label="Người quyết định">
                        {{ detail.decision_maker || '—' }}
                    </a-descriptions-item>

                    <a-descriptions-item label="Thư ký">{{ detail.secretary || '—' }}</a-descriptions-item>

                    <a-descriptions-item label="Người liên quan" :span="isMobile ? 1 : 2">
                        <template v-if="detail.related_people?.length">
                            {{ detail.related_people.join(', ') }}
                        </template>
                        <template v-else>—</template>
                    </a-descriptions-item>

                    <a-descriptions-item label="Thiết bị">{{ detail.devices || '—' }}</a-descriptions-item>

                    <a-descriptions-item label="Thành phần chuyên môn" :span="isMobile ? 1 : 2">
                        <template v-if="detail.specialists?.length">
                            {{ detail.specialists.join(', ') }}
                        </template>
                        <template v-else>—</template>
                    </a-descriptions-item>

                    <a-descriptions-item label="Thành phần tư vấn" :span="isMobile ? 1 : 2">
                        <template v-if="detail.advisors?.length">
                            {{ detail.advisors.join(', ') }}
                        </template>
                        <template v-else>—</template>
                    </a-descriptions-item>

                    <a-descriptions-item label="Ghi chú" :span="isMobile ? 1 : 2">
                        {{ detail.note || '—' }}
                    </a-descriptions-item>

                    <a-descriptions-item label="Tệp đính kèm">
                        <template v-if="detail.attachment_path">
                            <a :href="detail.attachment_path" target="_blank">Tải file</a>
                        </template>
                        <template v-else>Không có</template>
                    </a-descriptions-item>

                    <a-descriptions-item label="Nơi ghi nhận">{{ detail.result_record_location || '—'
                    }}</a-descriptions-item>
                    <a-descriptions-item label="Người tạo">{{ detail.created_by || '—' }}</a-descriptions-item>
                    <a-descriptions-item label="Tạo lúc">{{ detail.created_at || '—' }}</a-descriptions-item>
                </a-descriptions>

                <div class="mt-3 actions">
                    <a-button type="primary" @click="goEdit(detail)">Sửa</a-button>
                    <a-button v-if="isAdmin" danger class="ml-2" @click="confirmDelete(detail)">Xóa</a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { notification, Modal } from 'ant-design-vue'
import meetingService from '@/services/meeting_schedule_service/meetingService'
import { resolveStoragePath } from '@/utils/storageMeeting'

dayjs.extend(isBetween)

const router = useRouter()

const cursor = ref(dayjs())   // tháng đang xem
const loading = ref(false)
const isMobile = ref(false)
const isAdmin = true

// cache theo tháng: { 'YYYY-MM': [rawMapped] }
const monthCache = ref({})
// map theo ngày: { 'YYYY-MM-DD': [ev,...] }
const byDateMap = ref({})
// chi tiết 1 event
const detail = ref(null)
// modal danh sách trong ngày
const dayList = ref({ open: false, dateLabel: '', items: [] })

const MAX_PER_DAY = 3
const d = (x) => dayjs(x)

/** ===== API mapping giống component bảng của bạn ===== */
function mapDetailFromApi(m) {
    const dateStr = dayjs(m.start_at).format('YYYY-MM-DD')
    const startTime = dayjs(m.start_at).format('HH:mm')
    const endTime = dayjs(m.end_at).format('HH:mm')
    const fileUrl = m.files?.[0]?.path ? resolveStoragePath(m.files?.[0]?.path) : ''

    const getNames = (arr) =>
        (arr || [])
            .map((u) => u?.name ?? u?.full_name ?? u?.username ?? u?.id)
            .filter(Boolean)

    return {
        // cho calendar
        id: m.id,
        title: m.title,
        room: m.room?.name ?? '',
        start: d(m.start_at),
        end: d(m.end_at),
        // các trường “đầy đủ” như bảng
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
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
        created_at: m.created_at ? dayjs(m.created_at).format('YYYY-MM-DD HH:mm') : '',
        // trạng thái hiển thị badge
        level: m.level || m.status || 'processing',
    }
}

/** ===== Fetch theo tháng + cache ===== */
function monthKey(val = cursor.value) { return d(val).format('YYYY-MM') }

async function fetchMonth() {
    const key = monthKey()
    if (monthCache.value[key]) {
        buildByDate(monthCache.value[key])
        return
    }
    loading.value = true
    try {
        const start = d(cursor.value).startOf('month').format('YYYY-MM-DD')
        const end = d(cursor.value).endOf('month').format('YYYY-MM-DD')
        const res = await meetingService.list({ include_users: true, per_page: 500, date_from: start, date_to: end })
        const raw = Array.isArray(res?.data) ? res.data :
            Array.isArray(res) ? res :
                res?.data?.data ?? res?.data ?? []
        const mapped = raw.map(mapDetailFromApi)
        monthCache.value[key] = mapped
        buildByDate(mapped)
    } catch (e) {
        notification.error({
            message: 'Lỗi tải lịch',
            description: e?.response?.data?.message || e?.message || 'Không tải được dữ liệu'
        })
    } finally {
        loading.value = false
    }
}

/** Build byDateMap, xử lý event qua nhiều ngày */
function buildByDate(list) {
    const map = {}
    for (const ev of list) {
        const startDay = ev.start.startOf('day')
        const endDay = ev.end.startOf('day')
        const days = endDay.diff(startDay, 'day')
        for (let i = 0; i <= Math.max(0, days); i++) {
            const k = startDay.add(i, 'day').format('YYYY-MM-DD')
            if (!map[k]) map[k] = []
            map[k].push(ev)
        }
    }
    Object.values(map).forEach(arr => arr.sort((a, b) => a.start.valueOf() - b.start.valueOf()))
    byDateMap.value = map
}

/** ===== Helpers render ngày ===== */
function allEvents(day) {
    return byDateMap.value[d(day).format('YYYY-MM-DD')] || []
}
function visibleEvents(day) {
    return allEvents(day).slice(0, MAX_PER_DAY)
}
function hiddenCount(day) {
    const list = allEvents(day)
    return Math.max(0, list.length - MAX_PER_DAY)
}
function badge(ev) {
    const ok = ['success', 'processing', 'default', 'error', 'warning']
    const map = { approved: 'success', pending: 'processing', canceled: 'error' }
    const v = map[ev.level] || ev.level
    return ok.includes(v) ? v : 'processing'
}

/** ===== UI events ===== */
function onPanelChange(val) { cursor.value = val; fetchMonth() }
function goToday() { cursor.value = dayjs(); fetchMonth() }

function openDetail(ev) {
    // convert sang object detail chuẩn (đã mapping), hiển thị ngày/giờ theo format đẹp
    detail.value = {
        ...ev,
        // giữ nguyên các field đã mapDetailFromApi
    }
    dayList.value.open = false
}

function openDayList(day) {
    dayList.value.open = true
    dayList.value.dateLabel = d(day).format('DD/MM/YYYY')
    dayList.value.items = allEvents(day)
}

/** ===== Actions ===== */
function goEdit(ev) {
    router.push({ name: 'MeetingEdit', params: { id: ev.id } })
}

function confirmDelete(ev) {
    Modal.confirm({
        title: 'Xác nhận xóa lịch họp',
        content: `Bạn có chắc muốn xóa lịch họp "${ev.title}"?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        async onOk() {
            try {
                await meetingService.destroy(ev.id)
                notification.success({ message: 'Đã xóa thành công' })
                detail.value = null
                // reload tháng hiện tại
                // xoá cache và nạp lại
                monthCache.value[monthKey()] = undefined
                fetchMonth()
            } catch (e) {
                notification.error({
                    message: 'Xóa thất bại',
                    description: e?.response?.data?.message || e?.message || 'Không thể xóa lịch họp'
                })
            }
        }
    })
}

/** ===== Detect mobile ===== */
onMounted(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => (isMobile.value = mq.matches)
    apply()
    // compat
    if (mq.addEventListener) mq.addEventListener('change', apply)
    else mq.addListener(apply)

    fetchMonth()
})
</script>

<style scoped>
/* utilities */
.px-1 {
    padding-left: 4px;
    padding-right: 4px;
}

.mt-3 {
    margin-top: 12px;
}

.ml-2 {
    margin-left: 8px;
}

/* calendar cell */
.event-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.line {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.more-btn {
    padding: 0;
}

/* list in day modal */
.more-wrap {
    max-height: 60vh;
    overflow: auto;
}

.more-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 4px;
    border-bottom: 1px solid #f0f0f0;
}

.more-item:last-child {
    border-bottom: none;
}

.more-item.clickable {
    cursor: pointer;
}

/* detail modal responsive full-screen on mobile */
:global(.meeting-detail-modal .ant-modal) {
    top: 32px;
}

@media (max-width: 768px) {
    :global(.meeting-detail-modal .ant-modal) {
        top: 0 !important;
        padding: 0;
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0;
    }

    :global(.meeting-detail-modal .ant-modal-content) {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    :global(.meeting-detail-modal .ant-modal-body) {
        flex: 1;
        overflow: auto;
    }
}

.actions {
    display: flex;
    align-items: center;
}
</style>
