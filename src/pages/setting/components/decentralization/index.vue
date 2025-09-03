<template>
  <!-- Thanh công cụ: chọn vai trò + lưu -->
  <a-card style="margin-bottom: 16px">
    <a-form layout="inline">
      <a-form-item label="Vai trò">
        <a-select v-model:value="roleId" :options="roleOptions" style="min-width: 260px" placeholder="Chọn vai trò"
          :loading="loadingRoles" />
      </a-form-item>
      <a-button type="primary" :disabled="!roleId || !isDirty" :loading="saving" @click="save">
        Lưu thay đổi
      </a-button>
    </a-form>
  </a-card>

  <!-- Transfer: hiển thị “Chưa gán ↔ Đã gán” đúng chuẩn -->
  <a-card>
    <a-skeleton :loading="loadingUsers || loadingMembership" active>
      <a-transfer v-if="roleId" v-model:target-keys="targetKeys" :data-source="dataSource"
        :titles="['Chưa gán', 'Đã gán']" show-search :filter-option="filterOption"
        :render="item => `${item.title}${item.description ? ' — ' + item.description : ''}`"
        :list-style="{ width: '45%', height: '420px' }" @change="onTransferChange" />
      <div v-else class="text-gray-500">Vui lòng chọn một vai trò.</div>
    </a-skeleton>
  </a-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { notification } from 'ant-design-vue'
import roleService from '@/services/roleService'
import userService from '@/services/userService'
import permissionService from '@/services/permissionService'

/* Trạng thái tải dữ liệu */
const loadingRoles = ref(false)
const loadingUsers = ref(false)
const loadingMembership = ref(false)
const saving = ref(false)

/* Dữ liệu gốc */
const roles = ref([])
const users = ref([])

/* Vai trò đang chọn */
const roleId = ref(null)

/* Transfer state */
const targetKeys = ref([])          // trạng thái hiện tại (chuỗi id người dùng)
const originalTargetKeys = ref([])  // trạng thái ban đầu (chuỗi id người dùng)

/* Nguồn dữ liệu cho Transfer: toàn bộ người dùng */
const dataSource = computed(() =>
  users.value.map(u => ({
    key: String(u.id),
    title: u.name || `User #${u.id}`,
    description: u.email || '',
  }))
)

/* Danh sách lựa chọn vai trò */
const roleOptions = computed(() =>
  roles.value.map(r => ({ label: r.name, value: r.id }))
)

/* Tìm kiếm trong Transfer */
const filterOption = (input, item) =>
  (`${item.title} ${item.description}`.toLowerCase()).includes(input.toLowerCase())

/* Tải danh sách vai trò và người dùng */
async function loadRoles() {
  loadingRoles.value = true
  try {
    const res = await roleService.getAll()
    roles.value = res.data || []
    roleId.value = roles.value?.[0]?.id ?? null
  } finally {
    loadingRoles.value = false
  }
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const res = await userService.getAll()
    users.value = res.data || []
  } finally {
    loadingUsers.value = false
  }
}

/* Tải thành viên hiện có của vai trò → targetKeys */
async function loadMembership(id) {
  if (!id) return
  loadingMembership.value = true
  try {
    const res = await permissionService.getAllDataUserRole()
    const ids = (res.data || [])
      .filter(r => Number(r.role_id) === Number(id))
      .map(r => String(r.user_id))
    originalTargetKeys.value = [...ids]
    targetKeys.value = [...ids]
  } finally {
    loadingMembership.value = false
  }
}

/* Khi đổi vai trò → nạp lại membership */
watch(roleId, (id) => loadMembership(id))

/* Phát hiện thay đổi so với ban đầu để bật nút Lưu */
const isDirty = computed(() => {
  const a = [...originalTargetKeys.value].sort().join(',')
  const b = [...targetKeys.value].sort().join(',')
  return a !== b
})

/* Ghi nhận thay đổi (không bắt buộc, chỉ để debug nếu cần) */
function onTransferChange(nextTargetKeys /*, direction, moveKeys */) {
  targetKeys.value = nextTargetKeys
}

/* Lưu: tính phần thêm và gỡ rồi gọi dịch vụ hiện có */
async function save() {
  if (!roleId.value) return
  saving.value = true
  try {
    const newIds = targetKeys.value.map(k => Number(k))
    const oldIds = originalTargetKeys.value.map(k => Number(k))
    const added = newIds.filter(id => !oldIds.includes(id))
    const removed = oldIds.filter(id => !newIds.includes(id))

    // Gọi đồng thời các yêu cầu
    const addJobs = added.map(user_id =>
      permissionService.addUserRole({ role_id: roleId.value, user_id })
    )

    // Tìm đúng bản ghi ánh xạ để xoá
    const allMap = (await permissionService.getAllDataUserRole()).data || []
    const delJobs = removed.map(user_id => {
      const row = allMap.find(r =>
        Number(r.role_id) === Number(roleId.value) && Number(r.user_id) === Number(user_id)
      )
      if (row?.id) return permissionService.deleteUserRoll(row.id)
    })

    await Promise.all([...addJobs, ...delJobs])

    originalTargetKeys.value = [...targetKeys.value]
    notification.success({ message: 'Đã cập nhật thành viên của vai trò' })
  } catch (err) {
    notification.error({ message: 'Lỗi', description: err?.response?.data?.message || 'Không thể cập nhật.' })
  } finally {
    saving.value = false
  }
}

/* Khởi tạo */
onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()])
  if (roleId.value) await loadMembership(roleId.value)
})
</script>
