<template>
    <a-card style="margin-bottom: 16px">
        <div class="card-header">
            <div class="section-title">Danh sách phân quyền theo vai trò</div>
            <a-button class="addButton" type="primary" @click="openModal">+ Phân quyền</a-button>
        </div>

        <a-table :columns="columns" :dataSource="groupedPermissions" rowKey="key" bordered>

            <template #action="{ record }">
                <TableActionButtons :showEdit="true" :showDelete="true" :showView="true" @delete="handleDelete(record)"
                    @view="handleView(record)" @edit="handleEdit(record)" />
            </template>

        </a-table>
    </a-card>

    <!-- Modal phân quyền -->
    <a-modal v-model:open="showModal" title="Phân quyền cho vai trò" okText="Lưu" cancelText="Huỷ" @ok="handleSave">
        <a-form layout="vertical">
            <a-form-item label="Chọn vai trò">
                <a-select v-model:value="form.roleId" :disabled="isEdit" placeholder="Chọn vai trò">
                    <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                        {{ role.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item v-if="form.roleId" label="Chọn module">
                <a-select v-model:value="form.moduleId" :disabled="isEdit" placeholder="Chọn module">
                    <a-select-option v-for="mod in modules" :key="mod.id" :value="mod.id">
                        {{ mod.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>


            <a-form-item v-if="permissions.length" label="Chọn quyền (action)">
                <a-checkbox-group v-model:value="form.permissionIds">
                    <a-row>
                        <a-col :span="12" v-for="perm in permissions" :key="perm.id">
                            <a-checkbox :value="perm.id">
                                {{ perm.action?.name || 'Unknown Action' }}
                            </a-checkbox>
                        </a-col>
                    </a-row>
                </a-checkbox-group>
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- xem quyền -->
    <a-modal v-model:open="showViewModal" :title="`Chi tiết quyền của vai trò: ${viewRoleName}`" :footer="null"
        width="600px">
        <a-descriptions bordered column="1">
            <a-descriptions-item v-for="item in viewPermissions" :key="item.moduleName" :label="item.moduleName">
                {{ item.actions.join(', ') }}
            </a-descriptions-item>
        </a-descriptions>
    </a-modal>



</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'
import roleService from '@/services/roleService'
import moduleService from '@/services/moduleService'
import permissionService from '@/services/permissionService'
import { notification } from 'ant-design-vue'


const showModal = ref(false)

const form = ref({
    roleId: null,
    moduleId: null
})

const isEdit = ref(false)
const editingRoleId = ref(null)
const editingModuleId = ref(null)

const handleEdit = async (record) => {
  const roleId = record.roleId
  const moduleId = record.modulesRaw[0]?.moduleId
  if (!roleId || !moduleId) return

  isEdit.value = true
  editingRoleId.value = roleId
  editingModuleId.value = moduleId

  // Gọi API để lấy tất cả permission của module đó
  try {
    const res = await permissionService.getByModule(moduleId)
    permissions.value = res.data

    // Sau khi permissions được gán, mới set form (vue sẽ đánh dấu checkbox đúng)
    const selectedPermissions = rolePermissions.value
      .filter(
        (item) =>
          item.role?.id === roleId &&
          item.permission?.module?.id === moduleId
      )
      .map((item) => item.permission_id)

    form.value = {
      roleId,
      moduleId,
      permissionIds: selectedPermissions
    }

    showModal.value = true
  } catch (err) {
    notification.error({
      message: 'Lỗi',
      description: 'Không thể lấy danh sách quyền.'
    })
  }
}



const roles = ref([])
const modules = ref([])
const permissions = ref([])         // Danh sách permission liên quan module
const rolePermissions = ref([])
const columns = [
    {
        title: 'Vai trò',
        dataIndex: 'roleName',
        key: 'roleName'
    },
    {
        title: 'Module',
        dataIndex: 'modules',
        key: 'modules'
    },
    {
        title: 'Hành động',
        key: 'action',
        slots: { customRender: 'action' }
    }
]

watch(() => form.value.moduleId, async (moduleId) => {
  if (!moduleId) return

  try {
    const res = await permissionService.getByModule(moduleId)
    permissions.value = res.data

    // ✅ Chỉ reset nếu KHÔNG phải đang edit
    if (!isEdit.value) {
      form.value.permissionIds = []
    }
  } catch (err) {
    notification.error('Lỗi khi tải danh sách quyền theo module')
  }
})

const fetchRolePermissions = async () => {
    try {
        const res = await permissionService.getAllDataRolePermission()

        rolePermissions.value = res.data
    } catch (err) {
        notification.error('Lỗi khi tải danh sách phân quyền!')
    }
}
const groupedPermissions = computed(() => {
    const grouped = {}

    rolePermissions.value.forEach((item) => {
        const roleId = item.role?.id
        const roleName = item.role?.name
        const module = item.permission?.module

        if (!grouped[roleId]) {
            grouped[roleId] = {
                roleId,
                roleName,
                modulesSet: new Set(),
                modulesRaw: []
            }
        }

        grouped[roleId].modulesSet.add(module?.name)
        grouped[roleId].modulesRaw.push({
            moduleId: module?.id,
            permissionId: item.permission?.id
        })
    })

    return Object.entries(grouped).map(([roleId, data]) => ({
        key: roleId,
        roleId: parseInt(roleId),
        roleName: data.roleName,
        modules: Array.from(data.modulesSet).join(', '),
        modulesRaw: data.modulesRaw
    }))
})


const fetchRoles = async () => {
    try {
        const res = await roleService.getAll()
        roles.value = res.data
    } catch (err) {
        notification.error('Lỗi khi tải danh sách vai trò')
    }
}

const fetchModules = async () => {
    try {
        const res = await moduleService.getAll()
        modules.value = res.data
    } catch (err) {
        notification.error('Lỗi khi tải danh sách module')
    }
}

const openModal = () => {
    isEdit.value = false
    editingRoleId.value = null
    editingModuleId.value = null

    form.value = {
        roleId: null,
        moduleId: null,
        permissionIds: []
    }
    permissions.value = []
    showModal.value = true
}



const handleSave = async () => {
    const data = {
        roleId: form.value.roleId,
        moduleId: form.value.moduleId,
        permissionIds: form.value.permissionIds
    }

    try {
        if (isEdit.value) {
            await permissionService.updatePermission(data)
        } else {
            await permissionService.createPermission(data)
        }

        notification.success({
            message: 'Thành công',
            description: isEdit.value ? 'Cập nhật quyền thành công!' : 'Phân quyền thành công!'
        })

        showModal.value = false
        form.value = { roleId: null, moduleId: null, permissionIds: [] }
        fetchRolePermissions()
    } catch (err) {
        notification.error({
            message: 'Lỗi',
            description: 'Có lỗi xảy ra khi lưu phân quyền.'
        })
    }
}



const showViewModal = ref(false)
const viewPermissions = ref([]) // Danh sách module + actions của role đang xem
const viewRoleName = ref('')

const handleView = (record) => {
    const roleId = record.key // key là roleId bạn đã set
    const roleName = record.roleName

    // Lọc tất cả quyền có roleId này
    const permissionsOfRole = rolePermissions.value.filter(rp => rp.role?.id === parseInt(roleId))

    // Gom lại theo module
    const grouped = {}
    permissionsOfRole.forEach((rp) => {
        const moduleName = rp.permission?.module?.name
        const actionName = rp.permission?.action?.name

        if (!grouped[moduleName]) grouped[moduleName] = []
        grouped[moduleName].push(actionName)
    })

    // Gán dữ liệu vào viewPermissions
    viewPermissions.value = Object.entries(grouped).map(([moduleName, actions]) => ({
        moduleName,
        actions
    }))

    viewRoleName.value = roleName
    showViewModal.value = true
}

onMounted(async () => {
    await Promise.all([fetchRoles(), fetchModules()])
    fetchRolePermissions()
})

</script>
