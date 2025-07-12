<template>
  <a-layout-footer class="custom-footer">
    <div class="footer-text">
      Thiết kế & phát triển bởi <strong>Phòng CNTT</strong> ·
      <span class="divider">|</span>
      <span>© Vinh Gia Co., Ltd</span> ·
    </div>
  </a-layout-footer>
</template>

<script setup>
</script>

<style scoped>
.custom-footer {
  text-align: center;
  padding: 16px;
  font-size: 14px;
  color: #888;
  background-color: #f9f9f9;
  border-top: 1px solid #eaeaea;
}

.footer-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  align-items: center;
  line-height: 1.6;
}

.footer-text strong {
  color: #444;
}

.divider {
  color: #ccc;
}

.phone {
  font-weight: 500;
  color: #333;
}
</style>
