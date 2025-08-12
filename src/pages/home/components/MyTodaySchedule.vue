<template>
    <a-card :bordered="true" class="card">
        <template #title>📅 Lịch họp của bạn</template>

        <!-- Mini calendar -->
        <div class="cal-wrap">
            <a-calendar v-model:value="panelDate" :fullscreen="false" :validRange="validRange" @select="onSelect"
                @panelChange="onPanelChange">
                <template #headerRender>
                    <div class="cal-header">
                        <a-button size="small" @click="prevMonth">Tháng trước</a-button>
                        <div class="cal-title">{{ panelDate.format('MMMM YYYY') }}</div>
                        <a-space>
                            <a-button size="small" @click="goToday">Hôm nay</a-button>
                            <a-button size="small" @click="nextMonth">Tháng sau</a-button>
                        </a-space>
                    </div>
                </template>

                <!-- Custom cell -->
                <template #dateFullCellRender="{ current }">
                    <div class="cell" :class="{
                        'is-today': current.isSame(today, 'date'),
                        'is-selected': current.isSame(selectedDate, 'date'),
                        'has-meeting': hasMark(current),
                        'is-other-month': !current.isSame(panelDate, 'month'),
                    }" @click="onSelect(current)">
                        <div class="num">{{ current.date() }}</div>
                        <div class="dot" v-if="hasMark(current)"></div>
                    </div>
                </template>
            </a-calendar>
        </div>

        <!-- List for selected date -->
        <a-divider style="margin:12px 0" />
        <div class="list-head">
            <span>Ngày: <strong>{{ selectedDate.format('DD/MM/YYYY') }}</strong></span>
            <a-button size="small" @click="reloadDay" :loading="loadingList">Làm mới</a-button>
        </div>

        <a-skeleton :loading="loadingList" :active="true" :paragraph="{ rows: 2 }">
            <a-list v-if="meetings.length" :data-source="meetings" :split="true" style="background-color:#dba69d; padding: 10px; border-radius: 15px;" >
                <template #renderItem="{ item }">
                    <a-list-item class="clickable" @click="openDetail(item)">
                        <a-list-item-meta>
                            <template #title>
                                <div class="item-title">
                                    <ClockCircleOutlined style="margin-right:6px" />
                                    <span>{{ item.time }}</span>
                                    <span class="sep"> • </span>
                                    <strong>{{ item.title }}</strong>
                                </div>
                            </template>
                            <template #description>
                                <div class="item-desc">
                                    <div class="room-line">
                                        <EnvironmentOutlined style="margin-right:6px" />
                                        <span>{{ item.room || '—' }}</span>
                                    </div>
                                    <div v-if="item.note" class="muted">Ghi chú: {{ item.note }}</div>
                                </div>
                            </template>
                        </a-list-item-meta>
                        <div class="right-col">
                            <a-tag v-for="t in item.tags" :key="t">{{ t }}</a-tag>
                        </div>
                    </a-list-item>
                </template>
            </a-list>
            <a-empty v-else description="Hôm nay bạn không có cuộc họp nào." />
        </a-skeleton>
    </a-card>

    <!-- ===== Modal chi tiết ===== -->
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
        </template>
    </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { notification, Modal } from 'ant-design-vue'
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons-vue'
import meetingRoomService from '@/services/meeting_schedule_service/meetingService'
import { useAuthStore } from '@/stores/auth'
import { resolveStoragePath } from '@/utils/storageMeeting' // nếu bạn có util này

dayjs.locale('vi')

const router = useRouter()
const auth = useAuthStore()
const me = computed(() => auth.user || null)
const myId = computed(() => me.value?.id ?? null)
const isAdmin = computed(() => Number(me.value?.is_admin) === 1)

const isMobile = ref(false)

const norm = v => (v == null ? null : String(v))
const myIdStr = computed(() => norm(myId.value))
const idsFrom = arr => (arr || []).map(u => norm(u?.id ?? u)).filter(Boolean)

const today = dayjs()
const selectedDate = ref(today)
const panelDate = ref(today)
const validRange = undefined

const marks = ref(new Set())
const meetings = ref([])
const loadingList = ref(false)
const detail = ref(null)

function dateKey(d) { return dayjs(d).format('YYYY-MM-DD') }
function hasMark(d) { return marks.value.has(dateKey(d)) }
function goToday() { panelDate.value = dayjs(); onPanelChange(panelDate.value); onSelect(dayjs()) }
function prevMonth() { panelDate.value = panelDate.value.add(-1, 'month'); onPanelChange(panelDate.value) }
function nextMonth() { panelDate.value = panelDate.value.add(1, 'month'); onPanelChange(panelDate.value) }


function involvesMe(m) {
    const id = myIdStr.value
    return (
        idsFrom(m.stakeholders).includes(id) ||
        idsFrom(m.specialists).includes(id) ||
        idsFrom(m.advisors).includes(id) ||
        norm(m.secretary?.id ?? m.secretary_user_id) === id ||
        norm(m.decision_maker?.id ?? m.decision_maker_user_id) === id ||
        norm(m.created_by?.id ?? m.created_by_id ?? m.created_by_user_id ?? m.created_by) === id
    )
}

function timeRange(s, e) { return `${dayjs(s).format('HH:mm')} → ${dayjs(e).format('HH:mm')}` }

/* Map meeting → object chi tiết (cho modal) */
function mapDetailFromApi(m) {
    const getNames = arr => (arr || []).map(u => u?.name ?? u?.full_name ?? u?.username ?? u?.id).filter(Boolean)
    const fileUrl = m?.files?.[0]?.path ? resolveStoragePath(m.files[0].path) : ''

    return {
        id: m.id,
        title: m.title,
        room: m.room?.name ?? '',
        start: dayjs(m.start_at),
        end: dayjs(m.end_at),
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
        created_at: m.created_at ? dayjs(m.created_at).format('YYYY-MM-DD HH:mm') : ''
    }
}

async function loadMonthMarks(base) {
    if (!myIdStr.value) { marks.value = new Set(); return }
    try {
        const start = dayjs(base).startOf('month').format('YYYY-MM-DD')
        const end = dayjs(base).endOf('month').format('YYYY-MM-DD')
        const res = await meetingRoomService.list({ include_users: true, per_page: 1000, date_from: start, date_to: end })
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.data ?? res?.data ?? []
        const set = new Set()
        for (const m of raw) { if (involvesMe(m)) set.add(dayjs(m.start_at).format('YYYY-MM-DD')) }
        marks.value = set
    } catch (e) {
        notification.error({ message: 'Lỗi tải lịch tháng', description: e?.response?.data?.message || e?.message })
    }
}

async function loadDayList(day) {
    if (!myIdStr.value) { meetings.value = []; return }
    loadingList.value = true
    try {
        const d = dayjs(day).format('YYYY-MM-DD')
        const res = await meetingRoomService.list({ include_users: true, per_page: 200, date_from: d, date_to: d })
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.data ?? res?.data ?? []
        meetings.value = raw
            .filter(involvesMe)
            .map(m => {
                const det = mapDetailFromApi(m)
                return {
                    id: det.id,
                    title: det.title,
                    room: det.room,
                    time: timeRange(m.start_at, m.end_at),
                    note: det.note,
                    start_at: m.start_at,
                    detail: det
                }
            })
            .sort((a, b) => dayjs(a.start_at).valueOf() - dayjs(b.start_at).valueOf())
    } catch (e) {
        notification.error({ message: 'Lỗi tải lịch ngày', description: e?.response?.data?.message || e?.message })
    } finally {
        loadingList.value = false
    }
}

/* Open modal */
function openDetail(item) { detail.value = item.detail }

function onSelect(d) { selectedDate.value = dayjs(d); loadDayList(selectedDate.value) }
function onPanelChange(d) { panelDate.value = dayjs(d); loadMonthMarks(panelDate.value) }
function reloadDay() { loadDayList(selectedDate.value) }

/* Actions */
function goEdit(rec) { router.push({ name: 'MeetingEdit', params: { id: rec.id } }) }
async function confirmDelete(rec) {
    Modal.confirm({
        title: 'Xác nhận xóa lịch họp',
        content: `Bạn có chắc muốn xóa lịch họp "${rec.title}"?`,
        okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
        async onOk() {
            try {
                await meetingRoomService.destroy(rec.id)
                notification.success({ message: 'Đã xóa thành công' })
                detail.value = null
                await loadDayList(selectedDate.value)
                await loadMonthMarks(panelDate.value)
            } catch (e) {
                notification.error({ message: 'Xóa thất bại', description: e?.response?.data?.message || e?.message })
            }
        }
    })
}

/* wait for auth + responsive modal */
watch(() => myIdStr.value, (val, oldVal) => {
    if (val && !oldVal) {
        onPanelChange(panelDate.value)
        onSelect(selectedDate.value)
    }
}, { immediate: true })

onMounted(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => (isMobile.value = mq.matches)
    apply()
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply)
    if (myIdStr.value) { onPanelChange(panelDate.value); onSelect(selectedDate.value) }
})
</script>

<style scoped>
.card {
    overflow: hidden;
}

.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
}

.cal-title {
    font-weight: 600;
    letter-spacing: .3px;
    text-transform: capitalize;
}

.cal-wrap :deep(.ant-picker-panel) {
    border-radius: 12px;
}

.cell {
    position: relative;
    width: 36px;
    height: 36px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    transition: transform .05s ease;
}

.cell:hover {
    transform: scale(1.03);
}

.cell .num {
    font-size: 13px;
}

.cell.is-other-month .num {
    color: #c0c4cc;
}

.cell.is-today {
    outline: 2px dashed #C06252;
    outline-offset: 2px;
    border-radius: 12px;
}

.cell.is-selected {
    background: #c0625291;
    box-shadow: inset 0 0 0 2px #c0625273;
}

.cell.has-meeting .dot {
    position: absolute;
    bottom: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #C06252;
}

.list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 6px 2px 10px;
}

.item-title {
    font-size: 14px;
}

.item-desc {
    font-size: 13px;
    color: #374151;
}

.muted {
    color: #6b7280;
}

.right-col {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sep {
    color: #9ca3af;
    margin: 0 6px;
}

.room-line {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
}

/* modal responsive (nếu cần full-screen mobile thì dùng như dưới) */
:global(.meeting-detail-modal .ant-modal) {
    top: 32px;
}

@media (max-width:768px) {
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

.mt-3 {
    margin-top: 12px;
}

.ml-2 {
    margin-left: 8px;
}

.clickable {
    cursor: pointer;
}
</style>
