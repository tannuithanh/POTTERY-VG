<template>
    <a-space direction="vertical" size="large" style="width: 100%">
        <!-- Bảng 1: Hạng mục bảng tin -->
        <a-card>
            <div class="card-header">
                <div class="section-title">Danh sách hạng mục</div>
                <a-button class="addButton" @click="openAddModal">+ Thêm hạng mục</a-button>
            </div>
            <a-table :columns="newsCategoryColumns" :data-source="newsCategoryData" row-key="id" bordered
                :loading="loading" />
        </a-card>

        <!-- Bảng 2: Phân quyền chức năng -->
        <a-card>
            <div class="card-header">
                <div class="section-title">Danh sách phân quyền</div>
                <a-button class="addButton" @click="openAddPermissionModal">+ Phân quyền</a-button>
            </div>
            <a-table :columns="permissionColumns" :data-source="permissionData" row-key="id" bordered
                :loading="loadingPermission" />
        </a-card>
        <!-- Modal Thêm hạng mục -->
        <a-modal :visible="showModal" @update:visible="showModal = $event"
            :title="isEditMode ? 'Sửa hạng mục' : 'Thêm hạng mục mới'" @ok="handleSubmit"
            :ok-text="isEditMode ? 'Lưu' : 'Thêm'" cancel-text="Hủy">
            <a-form layout="vertical">
                <a-form-item label="Tên hạng mục">
                    <a-input v-model:value="form.name" placeholder="Nhập tên hạng mục" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Modal phân quyền -->
        <a-modal v-model:visible="showPermissionModal" title="Phân quyền người dùng" @ok="handleAddPermission"
            ok-text="Lưu" cancel-text="Hủy">
            <a-form layout="vertical">
                <a-form-item label="Người dùng">
                    <a-select show-search v-model:value="permissionForm.user_id" :options="userOptions"
                        placeholder="Chọn người dùng"
                        :filter-option="(input, option) => option.label.toLowerCase().includes(input.toLowerCase())" />
                </a-form-item>

                <a-form-item label="Hạng mục được phân quyền">
                    <a-select v-model:value="permissionForm.news_category_ids" mode="multiple"
                        placeholder="Chọn hạng mục" :options="categoryOptions" />
                </a-form-item>
            </a-form>
        </a-modal>
    </a-space>
</template>

<script setup>
/** 👉 Import **/
import { ref, onMounted, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import TableActionButtons from '@/components/common/TableActionButtons.vue'

import { useAuthStore } from '@/stores/auth'
import { newsCategoryService } from '@/services/news_service/newsCategoryService'
import userService from '@/services/userService'
import { newsPermissionService } from '@/services/news_service/newsPermissionService'

/** 👉 Store & state **/
const authStore = useAuthStore()
const loading = ref(false)

/** ================================
 *  📌 QUẢN LÝ HẠNG MỤC BẢNG TIN
 *  ================================ **/

// Modal + form
const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ id: null, name: '' })

// Dữ liệu bảng
const newsCategoryData = ref([])
const newsCategoryColumns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên hạng mục', dataIndex: 'name', key: 'name' },
    { title: 'Người tạo', dataIndex: 'creator_name', key: 'creator_name' },
    {
        title: 'Hành động',
        key: 'action',
        width: 120,
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: false,
                showSave: false,
                showCancel: false,
                onEdit: () => handleEdit(record),
                onDelete: () => handleDeleteConfirm(record)
            })
    }
]

// 📥 Lấy danh sách hạng mục
async function fetchCategories() {
    loading.value = true
    try {
        const res = await newsCategoryService.getAll()
        newsCategoryData.value = res.data.map((item, index) => ({
            ...item,
            stt: index + 1
        }))
    } catch (error) {
        message.error('Lỗi khi tải danh sách hạng mục!')
    } finally {
        loading.value = false
    }
}

// ➕ Mở modal thêm
function openAddModal() {
    isEditMode.value = false
    form.value = { id: null, name: '' }
    showModal.value = true
}

// ✏️ Mở modal sửa
function handleEdit(record) {
    isEditMode.value = true
    form.value = { ...record }
    showModal.value = true
}

// 💾 Thêm hoặc cập nhật
async function handleSubmit() {
    if (!form.value.name) return

    try {
        if (isEditMode.value) {
            await newsCategoryService.update(form.value.id, { name: form.value.name })
            message.success('Cập nhật thành công!')
        } else {
            await newsCategoryService.create({
                name: form.value.name,
                created_by: authStore.user.id
            })
            message.success('Thêm mới thành công!')
        }

        await fetchCategories()
        showModal.value = false
        form.value = { id: null, name: '' }
    } catch (error) {
        message.error('Đã xảy ra lỗi khi lưu dữ liệu.')
        console.error(error)
    }
}

// ❌ Xoá có confirm
function handleDeleteConfirm(record) {
    Modal.confirm({
        title: 'Bạn có chắc muốn xoá hạng mục này?',
        content: `Hạng mục: ${record.name}`,
        okText: 'Xoá',
        cancelText: 'Huỷ',
        okType: 'danger',
        async onOk() {
            try {
                await newsCategoryService.delete(record.id)
                await fetchCategories()
                message.success('Xoá thành công!')
            } catch (error) {
                message.error('Lỗi khi xoá!')
            }
        }
    })
}

/** ================================
 *  👥 PHÂN QUYỀN NGƯỜI DÙNG
 *  ================================ **/

// Modal & loading
const showPermissionModal = ref(false)
const loadingPermission = ref(false)

// Form & options
const permissionForm = ref({ user_id: null, news_category_ids: [] })
const userOptions = ref([])           // Danh sách người dùng
const categoryOptions = ref([])       // Danh sách hạng mục

// Bảng phân quyền (fake tạm thời)
const permissionData = ref([])
const permissionColumns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên người dùng', dataIndex: 'user_name', key: 'user_name' },
    { title: 'Hạng mục', dataIndex: 'categories', key: 'categories' },
    {
        title: 'Thao tác',
        key: 'action',
        width: 120,
        customRender: ({ record }) =>
            h(TableActionButtons, {
                showView: false,
                showEdit: false,
                onDelete: () => handleDeletePermission(record)
            })
    }
]

// ➕ Mở modal phân quyền
function openAddPermissionModal() {
    showPermissionModal.value = true
    permissionForm.value = { user_id: null, news_category_ids: [] }
    fetchPermissionOptions()
}

// 🔁 Lấy user & hạng mục để chọn trong modal
async function fetchPermissionOptions() {
    try {
        const [userRes, categoryRes] = await Promise.all([
            userService.getAll(),
            newsCategoryService.getAll()
        ])

        userOptions.value = userRes.data.map(u => ({
            label: u.name,
            value: u.id
        }))

        categoryOptions.value = categoryRes.data.map(c => ({
            label: c.name,
            value: c.id
        }))
    } catch (err) {
        message.error('Lỗi khi tải dữ liệu người dùng/hạng mục.')
    }
}
async function handleAddPermission() {
    try {
        const { user_id, news_category_ids } = permissionForm.value

        if (!user_id || news_category_ids.length === 0) {
            return message.warning('Vui lòng chọn đầy đủ người dùng và hạng mục!')
        }

        await newsPermissionService.assign(user_id, news_category_ids)
        message.success('Phân quyền thành công!')
        showPermissionModal.value = false
        permissionForm.value = { user_id: null, news_category_ids: [] }
        await fetchPermissions()

    } catch (error) {
        console.error(error)
        message.error('Lỗi khi phân quyền!')
    }
}
// 🚀 Lấy danh sách phân quyền
async function fetchPermissions() {
    loadingPermission.value = true
    try {
        const res = await newsPermissionService.getAll()

        permissionData.value = res.data.map((item, index) => ({
            stt: index + 1,
            user_id: item.user_id, // cần cho xoá
            user_name: item.user_name,
            categories: item.categories.map(c => c.name).join(', ')
        }))
    } catch (err) {
        console.error(err)
        message.error('Lỗi khi tải danh sách phân quyền!')
    } finally {
        loadingPermission.value = false
    }
}

// 🗑 Tạm placeholder
async function handleDeletePermission(record) {
    Modal.confirm({
        title: 'Xoá phân quyền?',
        content: `Xoá quyền của: ${record.user_name}`,
        async onOk() {
            try {
                await newsPermissionService.deleteByUser(record.user_id)
                message.success('Đã xoá phân quyền!')
                await fetchPermissions()
            } catch (err) {
                console.error(err)
                message.error('Lỗi khi xoá phân quyền!')
            }
        }
    })
}


onMounted(() => {
  fetchCategories()          // nếu bạn đang gọi
  fetchPermissions()         // mới thêm
})
</script>
