<template>
    <a-modal :title="record?.id ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'" :open="visible" @ok="onSubmit"
        @cancel="() => $emit('update:visible', false)" okText="Lưu" cancelText="Hủy">
        <a-form layout="vertical">
            <a-form-item label="Tên vai trò" required>
                <a-input v-model:value="form.name" />
            </a-form-item>
            <a-form-item label="Mã code" required>
                <a-input v-model:value="form.code" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import roleService from '@/services/roleService'
import { notification } from 'ant-design-vue'

const props = defineProps({
    visible: Boolean,
    record: Object
})
const emit = defineEmits(['update:visible', 'success'])

const form = reactive({ name: '', code: '' })

watch(() => props.record, (val) => {
    form.name = val?.name || ''
    form.code = val?.code || ''
}, { immediate: true })

const onSubmit = async () => {
    try {
        if (props.record?.id) {
            await roleService.update(props.record.id, form)
            notification.success({ message: 'Cập nhật vai trò thành công' })
        } else {
            await roleService.create(form)
            notification.success({ message: 'Thêm vai trò thành công' })
        }
        emit('success')
        emit('update:visible', false)
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: err?.response?.data?.message || 'Không thể lưu vai trò'
        })
    }
}
</script>
