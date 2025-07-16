<template>
    <a-modal :open="visible" width="900px" @cancel="close" :footer="null">
        <div class="print-area">
            <table class="form-header">
                <tbody>
                    <tr>
                        <td class="logo-cell" style="text-align: center;">
                            <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
                        </td>
                        <td class="title-cell">
                            <h1>GIẤY RA VÀO CỔNG</h1>
                        </td>
                        <td class="meta-cell" style="font-size: 13px;">
                            <div><strong>MÃ SỐ:</strong> BM03/HCNS</div>
                            <div><strong>LẦN BH:</strong> 02</div>
                            <div><strong>NGÀY BH:</strong> 15/09/2023</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="form-body">
                <div class="row right">
                    <span>{{ currentDate }}</span>
                </div>

                <div class="row">
                    <div class="col">
                        <label>Tôi tên là</label><span>: {{ data.fullName }}</span>
                    </div>
                    <div class="col">
                        <label>MSNV</label><span>: {{ data.msnv }}</span>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <label>Bộ phận</label><span>: {{ data.department }}</span>
                    </div>
                    <div class="col">
                        <label>Chức vụ</label><span>: {{ data.position }}</span>
                    </div>
                </div>

                <div>
                    <p>Được ra vào cổng công ty TNHH Vinh Gia:</p>
                </div>

                <div class="row">
                    <div class="col">
                        <label>- Từ ngày</label><span>: {{ fromDateFormatted }}</span>
                    </div>
                    <div class="col">
                        <label>Đến ngày</label><span>: {{ toDateFormatted }}</span>
                    </div>
                </div>

                <div class="row">
                    <div class="col"> 
                        <label>- Lý do</label><span>: {{ data.reason }}</span>
                    </div>
                </div>

                <table class="signatures-table">
                    <tbody>
                        <tr>
                            <td class="center">
                                <strong>QUẢN LÝ TRỰC TIẾP</strong>
                                <div class="signature">{{ data.manager }}</div>
                            </td>
                            <td class="center">
                                <strong>NGƯỜI ĐỀ NGHỊ</strong>
                                <div class="signature">{{ data.fullName }}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="actions">
                    <a-button type="primary" @click="$emit('back')">Hoàn thành</a-button>
                    <a-button danger>Hủy bỏ</a-button>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    visible: Boolean,
    data: Object,
})
const emit = defineEmits(['update:visible'])

const close = () => emit('update:visible', false)

const formatDate = (raw) => {
    if (!raw) return ''
    const date = new Date(raw)
    const pad = (n) => n.toString().padStart(2, '0')
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
const fromDateFormatted = computed(() => formatDate(props.data?.fromDate))
const toDateFormatted = computed(() => formatDate(props.data?.toDate))

</script>

<style scoped>
.signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 50px;
}

.signatures-table td {
    padding: 16px;
    vertical-align: top;
    border: none;
    /* ẩn border */
}

.center {
    text-align: center;
}

.signature {
    margin-top: 90px;
    /* để cách tên với dòng ký */
    font-weight: bold;
    text-decoration: underline;
}

.review-modal :deep(.ant-modal-content) {
    padding: 0;
}

.print-area {
    font-family: Tahoma;
    background: white;
    padding: 24px;
}

.form-header {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid black;
}

.logo-cell,
.title-cell,
.meta-cell {
    border: 1px solid black;
    padding: 8px;
    vertical-align: middle;
}

.logo {
    width: 80px;
}

.title-cell {
    text-align: center;
    font-weight: bold;
    font-size: 14px;
}

.meta-cell {
    font-size: 14px;
}

.form-body {
    margin-top: 24px;
}

.row {
    display: flex;
    margin-bottom: 8px;
    gap: 16px;
}

.col {
    width: 50%;
    display: flex;
}

.right {
    justify-content: flex-end;
}

label {
    width: 120px;
    font-weight: 600;
}

span {
    flex: 1;
}

.signatures {
    display: flex;
    justify-content: space-around;
    margin-top: 48px;
    text-align: center;
}

.signature {
    margin-top: 60px;
    font-weight: normal;
}

.actions {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    gap: 16px;
}
</style>
