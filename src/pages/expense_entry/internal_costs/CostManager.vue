<template>
    <div class="card-header toolbar">
        <div class="section-title">Danh sách tập hợp chi phí nội bộ</div>
    </div>

    <a-card bordered>
        <!-- Search UI only -->
        <CostSearchBar v-model="searchText" />
        <a-table :columns="columns" :data-source="rows" :scroll="{ x: 900 }" :pagination="false" bordered size="small" row-key="stt" />
    </a-card>
</template>

<script setup>
import { h, ref } from 'vue'
import CostSearchBar from './components/CostSearchBar.vue'
const searchText = ref('') // chỉ để hiển thị UI, không xử lý gì

const sub = (text) => h('div', { class: 'subnote' }, text)
const title = (main, note) =>
    h('div', { class: 'headwrap' }, [
        h('div', { class: 'headmain' }, main),
        note ? sub(note) : null
    ])

const columns = [
    { title: 'Stt', dataIndex: 'stt', align: 'center', width: 60 },
    { title: 'Ngày phát sinh chi phí', dataIndex: 'incurredDate', align: 'center', width: 160 },
    { title: () => title('Nội dung chi phí', '(Có vật tư thay thế nội bộ cần ghi rõ tên vật tư, số lượng thay thế)'), dataIndex: 'content', width: 280, align: 'center' },
    { title: () => title('Bộ phận được phân bổ chi phí', '(theo phụ lục quy định)'), dataIndex: 'department', align: 'center', width: 220 },
    {
        title: 'Thiết bị', align: 'center', children: [
            { title: 'Tên thiết bị', dataIndex: 'deviceName', align: 'center', width: 180 },
            { title: 'Mã số thiết bị', dataIndex: 'deviceCode', align: 'center', width: 150 },
        ]
    },
    {
        title: 'Chi phí phát sinh (VNĐ)', align: 'center', children: [
            {
                title: 'Có hóa đơn', align: 'center', children: [
                    { title: () => title('Chi phí chính thức', '(Giá trị theo hóa đơn chưa bao gồm thuế)'), dataIndex: 'officialAmount', align: 'center', width: 170, customRender: ({ text }) => formatMoney(text) },
                    { title: 'Số hóa đơn', dataIndex: 'invoiceNo', align: 'center', width: 140 },
                    { title: 'Loại thiết bị', dataIndex: 'deviceType', align: 'center', width: 140 },
                ]
            },
            { title: () => title('Chi phí khái toán/ấn', '(Giá trị theo công thức/thực tế)'), dataIndex: 'estimatedAmount', align: 'center', width: 170, customRender: ({ text }) => formatMoney(text) }
        ]
    },
    { title: () => title('Ghi chú', '(ghi chú HHH nếu bút chung form Vĩnh Gia)'), dataIndex: 'note', width: 220 }
]

const rows = ref([
    {
        stt: '...', incurredDate: '...', content: '...', department: '...', deviceName: '...', deviceCode: '...',
        deviceType: '...', officialAmount: '...', invoiceNo: '...', estimatedAmount: '...', note: '...'
    }
])

const formatMoney = (v) => {
    const n = Number(v ?? 0)
    if (!Number.isFinite(n)) return ''
    return n.toLocaleString('vi-VN')
}
</script>

<style scoped>
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
}

.search-box {
    max-width: 360px;
    width: 100%;
}

.headwrap {
    line-height: 1.15;
}

.headmain {
    font-weight: 600;
}

.subnote {
    font-style: italic;
    font-size: 12px;
    opacity: 0.85;
}

@media (max-width: 576px) {
    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }
}
</style>
