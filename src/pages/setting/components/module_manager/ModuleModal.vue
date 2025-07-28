<template>
    <a-modal :title="record ? 'Chỉnh sửa chức năng' : 'Thêm mới chức năng'" :visible="visible" @ok="onSubmit"
        @cancel="() => $emit('update:visible', false)">
        <a-form layout="vertical">
            <a-form-item label="Mã chức năng (code)"
                :rules="[{ required: true, message: 'Vui lòng nhập mã chức năng' }]">
                <a-input v-model:value="form.code" />
            </a-form-item>

            <a-form-item label="Tên chức năng" :rules="[{ required: true, message: 'Vui lòng nhập tên chức năng' }]">
                <a-input v-model:value="form.name" />
            </a-form-item>
        </a-form>


    </a-modal>
</template>

<script setup>
import { watch, reactive, h } from 'vue'
import moduleService from '@/services/moduleService'
import {  notification } from 'ant-design-vue'

const props = defineProps({
    visible: Boolean,
    record: Object
})

const emit = defineEmits(['update:visible', 'success'])

const form = reactive({
    code: '',
    name: ''
})

// Gán dữ liệu khi chỉnh sửa
watch(
    () => props.record,
    (val) => {
        form.code = val?.code || ''
        form.name = val?.name || ''
    },
    { immediate: true }
)

// Reset khi modal đóng
watch(
    () => props.visible,
    (val) => {
        if (!val) {
            form.code = ''
            form.name = ''
        }
    }
)

const onSubmit = async () => {
  const payload = { ...form }

  try {
    if (props.record?.id) {
      await moduleService.update(props.record.id, payload)
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Chức năng đã được cập nhật.'
      })
    } else {
      await moduleService.create(payload)
      notification.success({
        message: 'Tạo thành công',
        description: 'Chức năng mới đã được thêm.'
      })
    }

    emit('success')
    emit('update:visible', false)
  } catch (err) {
    const msg = err?.response?.data?.message || 'Đã có lỗi xảy ra'
    notification.error({
      message: 'Lỗi',
      description: msg
    })
  }
}



</script>
