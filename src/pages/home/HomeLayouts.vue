<template>
    <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
            <CompanyNews />
        </a-col>
        <a-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
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
