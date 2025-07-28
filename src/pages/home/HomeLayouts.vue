<template>
    <a-row :gutter="16">
        <a-col :span="10">
            <CompanyNews />
        </a-col>
        <a-col :span="14">
            <GatePassChart />
        </a-col>
    </a-row>
</template>

<script setup>
import CompanyNews from './components/CompanyNews.vue'
import GatePassChart from './components/GatePassChart.vue'
</script>

<style scoped>
:deep(.ant-card-body) {
    padding: 16px !important;
}
</style>
