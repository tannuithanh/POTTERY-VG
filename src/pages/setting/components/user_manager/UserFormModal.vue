<template>
    <a-modal :open="modelValue" :title="isEdit ? 'Cập nhật nhân sự' : 'Thêm nhân sự'" @ok="handleSubmit"
        @cancel="emit('update:modelValue', false)" ok-text="Lưu" cancel-text="Hủy" :confirm-loading="loading">
        <a-form layout="vertical" :model="form">
            <a-row :gutter="16">
                <!-- Cột trái -->
                <a-col :span="12">
                    <a-form-item label="Họ và tên">
                        <a-input v-model:value="form.name" placeholder="Nhập họ và tên" />
                    </a-form-item>

                    <a-form-item label="Mã số nhân viên">
                        <a-input v-model:value="form.msnv" placeholder="Mã số nhân viên" />
                    </a-form-item>

                    <a-form-item label="Số điện thoại" name="phone">
                        <a-input v-model:value="form.phone" placeholder="Nhập số điện thoại" />
                    </a-form-item>

                    <a-form-item label="Địa chỉ" name="address">
                        <a-input v-model:value="form.address" placeholder="Nhập địa chỉ" />
                    </a-form-item>

                    <a-form-item label="Mail">
                        <a-input v-model:value="form.email" placeholder="example@company.com" />
                    </a-form-item>
                </a-col>

                <!-- Cột phải -->
                <a-col :span="12">
                    <a-form-item label="Chức vụ">
                        <a-select v-model:value="form.position_id"
                            :options="positions.map(p => ({ label: p.name, value: p.id }))"
                            placeholder="Chọn chức vụ" />
                    </a-form-item>

                    <a-form-item label="Mô tả chức vụ">
                        <a-input v-model:value="form.position_detail" placeholder="Nhập mô tả" />
                    </a-form-item>

                    <a-form-item label="Phòng ban">
                        <a-select v-model:value="form.department_id"
                            :options="departments.map(d => ({ label: d.name, value: d.id }))"
                            placeholder="Chọn phòng ban" />
                    </a-form-item>

                    <a-form-item label="Bộ phận">
                        <a-input v-model:value="form.division" placeholder="Nhập bộ phận" />
                    </a-form-item>

                    <a-form-item label="Quyền truy cập">
                        <a-radio-group v-model:value="form.isAdmin">
                            <a-radio :value="1" :disabled="!props.currentUserIdIsAdmin">Admin</a-radio>
                            <a-radio :value="0">Người dùng thường</a-radio>
                        </a-radio-group>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>

    </a-modal>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { message, notification } from 'ant-design-vue'
import userService from '@/services/userService'
import positionService from '@/services/positionSerivce'
import departmentService from '@/services/departmentService'


const props = defineProps({
    modelValue: Boolean,
    form: Object,
    isEdit: Boolean,
    currentUserIdIsAdmin: Boolean
})
const emit = defineEmits(['update:modelValue', 'success'])
const positions = ref([])
const departments = ref([])
const loading = ref(false)


const handleSubmit = async () => {
    loading.value = true
    try {
        // ✅ VALIDATE thủ công
        if (!props.form.name?.trim()) throw new Error('Vui lòng nhập họ và tên')
        if (!props.form.msnv?.trim()) throw new Error('Vui lòng nhập mã số nhân viên')
        if (!props.form.position_id) throw new Error('Vui lòng chọn chức vụ')
        if (!props.form.position_detail?.trim()) throw new Error('Vui lòng nhập mô tả chức vụ')
        if (!props.form.email?.trim()) throw new Error('Vui lòng nhập email')
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(props.form.email)) throw new Error('Email không đúng định dạng')
        if (!props.form.department_id) throw new Error('Vui lòng chọn phòng ban')
        if (!props.form.division?.trim()) throw new Error('Vui lòng nhập bộ phận')

        // ✅ BUILD PAYLOAD
        const payload = {
            name: props.form.name,
            msnv: props.form.msnv,
            email: props.form.email,
            password: props.isEdit ? undefined : '123',
            phone: props.form.phone,
            address: props.form.address,
            department_id: props.form.department_id,
            position_id: props.form.position_id,
            position_detail: props.form.position_detail,
            division: props.form.division,
            is_admin: props.form.isAdmin
        }

        // ✅ CALL API
        if (props.isEdit) {
            await userService.update(props.form.id, payload)
            console.log(payload)
            notification.success({ message: 'Cập nhật thành công' })
        } else {
            await userService.create(payload)
            notification.success({ message: 'Tạo mới thành công' })
        }

        emit('success')
        emit('update:modelValue', false)
    } catch (err) {
        message.error(err.message || err.response?.data?.message || 'Lỗi xảy ra')
    } finally {
        loading.value = false
    }
}


onMounted(async () => {
    try {
        const [posRes, depRes] = await Promise.all([
            positionService.getAll(),
            departmentService.getAll()
        ])
        positions.value = posRes.data
        departments.value = depRes.data
    } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err)
    }
})


</script>