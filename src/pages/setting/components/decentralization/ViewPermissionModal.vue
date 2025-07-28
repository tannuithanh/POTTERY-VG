<template>
  <a-modal :visible="visible" @visible:open="val => $emit('update:visible', val)"
    :title="`Chi tiết quyền của vai trò: ${roleName}`" footer={null}>
    <a-list bordered :data-source="items">
      <template #renderItem="{ item }">
        <a-list-item>
          <b>{{ item.moduleName }}</b>: {{ item.actions.join(', ') }}
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>

<script setup>
defineProps({
  visible: Boolean,
  roleName: String,
  items: Array
})

defineEmits(['update:visible'])
</script>
