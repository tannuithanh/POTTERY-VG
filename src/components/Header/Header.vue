<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { resolveDynamicComponent } from 'vue'
import HeaderMobile from './HeaderMobile.vue'
import HeaderDesktop from './HeaderDesktop.vue'

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

const currentComponent = computed(() =>
  resolveDynamicComponent(isMobile.value ? HeaderMobile : HeaderDesktop)
)
</script>
