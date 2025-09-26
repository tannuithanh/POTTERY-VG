  <template>
    <a-layout-sider theme="light" v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/images/logo.png" alt="Logo" width="75" />
        </router-link>
      </div>
      <a-menu :selectedKeys="[activeKey]" theme="light" mode="inline">
        <a-menu-item key="home">
          <router-link to="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </router-link>
        </a-menu-item>
        <a-sub-menu v-if="user.user?.is_admin || user.modules.some(m => m.code === 'form')" key="profile"
          :icon="h(IdcardOutlined)" title="Hồ sơ điện tử">
          <a-menu-item key="forms_create">
            <router-link to="/forms_create">Tạo hồ sơ điện tử</router-link>
          </a-menu-item>
          <a-menu-item key="profile-list">
            <router-link to="/check_form_create">Danh sách hồ sơ</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="news" :icon="h(ProfileOutlined)" title="Bảng tin">
          <a-menu-item v-if="user.user?.is_admin || user.modules.some(m => m.code === 'news')" key="create_news">
            <router-link to="/create_news">Tạo bảng tin</router-link>
          </a-menu-item>
          <a-menu-item key="news_list">
            <router-link to="/news_list">Thông tin bảng tin</router-link>
          </a-menu-item>
          <a-menu-item v-if="user.user?.is_admin || user.modules.some(m => m.code === 'news')" key="News-list_manager">
            <router-link to="/news_list_manager">Danh sách hồ sơ</router-link>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="meetings" :icon="h(CalendarOutlined)" title="Lịch họp">
          <a-menu-item key="meeting-manager">
            <router-link to="/meeting-manager">Quản lý lịch họp</router-link>
          </a-menu-item>
          <a-menu-item key="create_meeting">
            <router-link to="/create-meeting">Đăng ký lịch họp</router-link>
          </a-menu-item>
          <a-menu-item key="meeting-calendar">
            <router-link to="/meeting-calendar">Lịch tháng</router-link>
          </a-menu-item>
        </a-sub-menu>
        <!-- <a-sub-menu key="cost-journal" :icon="h(BookOutlined)" title="Bút toán chi phí">
          <a-sub-menu key="internal-costs" title="Chi phí nội bộ">
            <a-menu-item key="internal-add">
              <router-link to="/expense-entry/internal-costs/add_costs">Thêm chi phí</router-link>
            </a-menu-item>
            <a-menu-item key="internal-list">
              <router-link to="/expense-entry/internal-costs/costs_manager">Quản lý chi phí</router-link>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="customer-costs">
            <router-link to="/cost-journal/customer">Chi phí khách hàng</router-link>
          </a-menu-item>
        </a-sub-menu> -->
      </a-menu>
    </a-layout-sider>
  </template>


<script setup>
import { HomeOutlined, IdcardOutlined, ProfileOutlined, CalendarOutlined, BookOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'
import { computed, ref, h } from 'vue'
import { useAuthStore } from '@/stores/auth'

const collapsed = ref(false)
const route = useRoute()

const user = useAuthStore();
console.log(user)
const activeKey = computed(() => {
  const path = route.path;

  if (path === '/') return 'home';
  if (path.startsWith('/forms_create')) return 'forms_create';
  if (path.startsWith('/check_form_create')) return 'profile-list';

  if (path.startsWith('/create_news')) return 'create_news';
  if (path.startsWith('/news_list_manager')) return 'News-list_manager';
  if (path.startsWith('/news_list')) return 'news_list';
  if (path.startsWith('/meeting-manager')) return 'meeting-manager';
  if (path.startsWith('/create-meeting')) return 'create-meeting';
  if (path.startsWith('/meeting-calendar')) return 'meeting-calendar';
  if (path.startsWith('/expense-entry/internal-costs/add_costs')) return 'internal-add';
  if (path.startsWith('/expense-entry/internal-costs/costs_manager')) return 'internal-list';
  return '';
});

</script>

<style scoped>
.logo {
  height: 90px;
  margin: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
</style>
