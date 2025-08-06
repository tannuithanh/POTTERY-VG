<template>
    <div class="chart-card">
        <div class="chart-header">
            <span class="title">📊 Biểu đồ giấy ra/vào cổng</span>
            <span class="month">{{ currentMonth }}</span>
        </div>

        <div v-if="loading" class="chart-loading">Đang tải dữ liệu...</div>
        <div v-else-if="error" class="chart-error">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>

        <template v-else>
            <v-chart :option="option" autoresize style="height: 450px" />
            <div class="total-count">Tổng: {{ totalCount }} phiếu</div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formInstanceService } from '@/services/form_service/formInstanceService'

use([
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    CanvasRenderer
])

const option = ref({})
const chartData = ref([])
const currentMonth = ref('')
const loading = ref(true)
const error = ref(false)
const totalCount = ref(0)

onMounted(async () => {
    const now = new Date()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    currentMonth.value = `Tháng ${month}/${year}`

    try {
        const res = await formInstanceService.getGatePassStats()
        chartData.value = res.data.data || []

        const labels = chartData.value.map(item => item.department)
        const counts = chartData.value.map(item => item.count)
        totalCount.value = counts.reduce((a, b) => a + b, 0)
        const max = Math.max(...counts)

        option.value = {
            tooltip: { trigger: 'axis' },
            grid: { left: 100, right: 20, bottom: 20, containLabel: true },
            dataZoom: [
                { type: 'slider', yAxisIndex: 0, width: 10, right: 0 },
                { type: 'inside', yAxisIndex: 0 }
            ],
            xAxis: {
                type: 'value',
                name: 'Số lượng giấy',
                nameTextStyle: { color: '#c06252' },
                axisLabel: { color: '#c06252' }
            },
            yAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    interval: 0,
                    color: '#c06252',
                    fontSize: 12
                }
            },
            series: [
                {
                    name: 'Phiếu',
                    type: 'bar',
                    data: counts,
                    itemStyle: {
                        color: val => val.value === max ? '#ff8c00' : '#c06252'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}',
                        color: '#444'
                    }
                }
            ]
        }
    } catch (err) {
        console.error('Lỗi khi tải dữ liệu biểu đồ:', err)
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.chart-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-height: 500px;
    position: relative;
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

.total-count {
    text-align: right;
    font-size: 14px;
    margin-top: 10px;
    color: #555;
}

.chart-loading,
.chart-error {
    text-align: center;
    font-size: 14px;
    color: #999;
    padding: 50px 0;
}
</style>
