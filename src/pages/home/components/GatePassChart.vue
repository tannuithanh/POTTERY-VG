<template>
    <div class="chart-card">
        <div class="chart-header">
            <span class="title">📊 Biểu đồ giấy ra/vào cổng</span>
            <span class="month">Tháng 07/2025</span>
        </div>
        <v-chart :option="option" autoresize style="height: 360px" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const option = ref({})

onMounted(() => {
    option.value = {
        tooltip: { trigger: 'axis' },
        grid: { left: 60, bottom: 80 },
        xAxis: {
            type: 'category',
            data: [
                'BAN GIAM DOC', 'CNTT - TRỢ LÝ', 'BẢO VỆ', 'PHÒNG VẬT TƯ', 'PHÒNG KẾ TOÁN',
                'BAN KIỂM SOÁT - TOÀN ÁN', 'PHÒNG QA', 'PHÒNG DVKH', 'PHÒNG ĐÁNH GIÁ',
                'KẾ HOẠCH SẢN XUẤT', 'PHÁT TRIỂN SẢN PHẨM', 'KT THUẬT - CÔNG NGHỆ',
                'ĐIỀU HÀNH SẢN XUẤT', 'XỊ MĂNG 1', 'XỊ MĂNG 2', 'KHO VẬT TƯ',
                'KHO THÀNH PHẨM', 'ĐÓNG GÓI', 'QUẢN LÝ CHẤT LƯỢNG', 'KẾ HOẠCH KINH DOANH',
                'SƠN MÀU', 'PHA SƠN', 'HÀNH CHÍNH - NHÂN SỰ', 'ĐIỀU HÀNH SẢN XUẤT HHH',
                'KHO THÀNH PHẨM HHH', 'KHO VẬT TƯ HHH', 'SƠN MÀU HHH', 'ĐỨC - HOÀN TẤT HHH'
            ],
            axisLabel: {
                interval: 0,
                rotate: 45,
                color: '#b2493e',
                fontSize: 11
            }
        },
        yAxis: {
            name: 'Số lượng giấy',
            nameTextStyle: { color: '#b2493e' },
            axisLabel: { color: '#b2493e' }
        },
        series: [
            {
                name: 'Phiếu',
                type: 'bar',
                data: Array.from({ length: 28 }, () => Math.floor(Math.random() * 20)),
                itemStyle: { color: '#b2493e' }
            }
        ]
    }
})
</script>

<style scoped>
.chart-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    color: #b2493e;
    margin-bottom: 8px;
}

.month {
    background: #b2493e;
    color: white;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
}
</style>
