<template>
    <a-row :gutter="[16, 16]" align="stretch" class="dash-row">
        <a-col :xs="24" :lg="10">
            <CompanyNews />
        </a-col>
        <a-col :xs="24" :lg="14">
            <MyTodaySchedule />
        </a-col>
    </a-row>


</template>


<script setup>
import CompanyNews from './components/CompanyNews.vue'
// import GatePassChart from './components/GatePassChart.vue'
import MyTodaySchedule from './components/MyTodaySchedule.vue';
</script>

<style scoped>
.dash-row :deep(.ant-col) {
    display: flex;
}

/* cột là flex */
.dash-row :deep(.ant-card) {
    width: 100%;
    height: 100%;
}

/* card full height */
:deep(.ant-card-body) {
    padding: 16px !important;
}
</style>
