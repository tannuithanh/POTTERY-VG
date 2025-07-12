<template>
  <div class="user-profile-wrapper">
    <div class="section-title">THÔNG TIN NGƯỜI DÙNG</div>
    <a-row :gutter="[16, 16]">
      <a-col :span="24" :md="6">
        <UserAvatarCard :user="user" />
      </a-col>

      <a-col :span="24" :md="18">
        <UserDetailTable :user="user" />
      </a-col>

      <a-col :span="24">
        <UserSignature :signature="user.signature" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import UserAvatarCard from './components/UserAvatarCard.vue'
import UserDetailTable from './components/UserDetailTable.vue'
import UserSignature from './components/UserSignature.vue'

const user = {
  name: 'Nguyễn Văn A',
  code: 'NV01234',
  email: 'nguyenvana@vinhgiapottery.com',
  position: 'Trưởng phòng Kỹ thuật',
  description:
    'Phụ trách hệ thống phần mềm và quản lý hạ tầng kỹ thuật công nghệ thông tin.',
  avatar: 'https://i.pravatar.cc/150?img=10',
  signature: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe8wBK0d0QukghPwb_8QvKjEzjtEjIszRwbA&s',
}
</script>