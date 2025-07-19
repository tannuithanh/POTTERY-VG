<template>
  <a-card style="margin-bottom: 16px">
    <div class="card-header">
      <div class="section-title">Danh sách vai trò</div>
      <a-button class="addButton" type="primary" @click="$emit('create')">+ Thêm vai trò</a-button>
    </div>
    <a-table :columns="columns" :dataSource="roles" rowKey="id" bordered @rowClick="onSelect">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>

        <template v-if="column.key === 'action'">
          <TableActionButtons :showEdit="true" :showDelete="true" :showView="false" @edit="$emit('edit', record)"
            @delete="$emit('delete', record)" />
        </template>
      </template>
    </a-table>

  </a-card>
</template>

<script setup>
import TableActionButtons from '@/components/common/TableActionButtons.vue'


const props = defineProps({ roles: Array })
const emit = defineEmits(['create', 'edit', 'delete', 'select'])

const columns = [
  {
    title: 'STT',
    key: 'index',
    dataIndex: 'index',
    align: 'center',
    width: 70
  },
  { title: 'Tên vai trò', dataIndex: 'name', key: 'name' },
  { title: 'Mã code', dataIndex: 'code', key: 'code' },
  { title: 'Hành động', key: 'action' }
]


const onSelect = (_, record) => emit('select', record)
</script>
