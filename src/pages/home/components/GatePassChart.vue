<template>
    <div class="chart-card">
        <div class="chart-header">
            <span class="title">📊 Biểu đồ giấy ra/vào cổng</span>
            <span class="month">Tháng 07/2025</span>
        </div>
        <v-chart :option="option" autoresize style="height: 425px" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formInstanceService } from '@/services/form_service/formInstanceService'
import { DataZoomComponent } from 'echarts/components'

use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer, DataZoomComponent])

const option = ref({})
const chartData = ref([])

// Gọi API khi mounted
onMounted(async () => {
    try {
        const res = await formInstanceService.getGatePassStats()
        chartData.value = res.data.data || []

        // Chuyển data sang định dạng ECharts
        const labels = chartData.value.map(item => item.department)
        const counts = chartData.value.map(item => item.count)

        option.value = {
            tooltip: { trigger: 'axis' },
            grid: { left: 20, bottom: 20, containLabel: true },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: 0,
                    height: 20,
                    bottom: 0
                },
                {
                    type: 'inside',
                    xAxisIndex: 0
                }
            ],
            xAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    color: '#c06252',
                    fontSize: 10
                }
            },
            yAxis: {
                name: 'Số lượng giấy',
                nameTextStyle: { color: '#c06252' },
                axisLabel: { color: '#c06252' }
            },
            series: [
                {
                    name: 'Phiếu',
                    type: 'bar',
                    data: counts,
                    itemStyle: { color: '#c06252' }
                }
            ]
        }

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu biểu đồ:', error)
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
    color: #c06252;
    margin-bottom: 8px;
}

.month {
    background: #c06252;
    color: white;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
}
</style>
