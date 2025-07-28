<template>
    <a-modal :visible="visible" @update:visible="val => emit('update:visible', val)" title="Phân quyền người dùng"
        okText="Lưu" cancelText="Huỷ" @ok="handleSubmit" :confirmLoading="loading">
        <a-form layout="vertical">
            <!-- Select vai trò -->
            <a-form-item label="Vai trò" name="role_id">
                <a-select v-model:value="form.role_id" placeholder="Chọn vai trò">
                    <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                        {{ role.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <!-- Select người dùng MULTI -->
            <a-form-item label="Người dùng" name="user_ids" v-if="form.role_id">
                <a-space class="mb-2">
                    <a-button size="small" type="link" @click="selectAllUsers">Chọn tất cả</a-button>
                    <a-button size="small" type="link" danger @click="clearAllUsers">Bỏ chọn tất cả</a-button>
                </a-space>

                <a-select v-model:value="form.user_ids" mode="multiple" :options="userOptions"
                    placeholder="Chọn người dùng để gán vai trò" optionFilterProp="label" showSearch allowClear />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, watch, computed, h } from 'vue'
import { notification } from 'ant-design-vue'
import roleService from '@/services/roleService'
import userService from '@/services/userService'


const props = defineProps({
    visible: Boolean
})

const emit = defineEmits(['update:visible', 'submit'])

const form = ref({
    role_id: null,
    user_ids: []
})
const selectAllUsers = () => {
    form.value.user_ids = users.value.map(user => user.id)
}

const clearAllUsers = () => {
    form.value.user_ids = []
}
const loading = ref(false)
const roles = ref([])
const users = ref([])
// Load người dùng
const fetchUsers = async () => {
    try {
        const res = await userService.getAll()
        users.value = res.data
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Không thể tải danh sách người dùng'
        })
    }
}

// Khi mở modal
watch(() => props.visible, async (val) => {
    if (val) {
        form.value = {
            role_id: null,
            user_ids: []
        }
        await fetchRoles()
        await fetchUsers()
    }
})

// 🔄 API gọi tất cả vai trò
const fetchRoles = async () => {
    try {
        const res = await roleService.getAll()
        roles.value = res.data
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Không thể tải danh sách vai trò'
        })
    }
}

const userOptions = computed(() =>
    users.value.map(u => ({
        label: u.name || u.email || `User #${u.id}`,
        value: u.id
    }))
)

const handleSubmit = async () => {
    if (!form.value.role_id) {
        return notification.warning({
            message: 'Thiếu thông tin',
            description: 'Vui lòng chọn vai trò.'
        })
    }

    if (!form.value.user_ids || form.value.user_ids.length === 0) {
        return notification.warning({
            message: 'Thiếu thông tin',
            description: 'Vui lòng chọn ít nhất một người dùng.'
        })
    }

    try {
        loading.value = true
        await emit('submit', form.value)
        emit('update:visible', false)
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Không thể phân quyền!'
        })
    } finally {
        loading.value = false
    }
}

</script>
