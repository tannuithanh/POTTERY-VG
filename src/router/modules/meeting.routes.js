import CreateMeeting from "@/pages/meeting_schedule/CreateMeeting.vue";
import EditMeetingForm from "@/pages/meeting_schedule/EditMeetingForm.vue";
import MeetingCalendarPage from "@/pages/meeting_schedule/MeetingCalendarPage.vue";
import MeetingManager from "@/pages/meeting_schedule/meetingManager.vue";

export default [
  {
    path: "/create-meeting",
    name: "createMeeting",
    component: CreateMeeting,
    meta: { title: "Đăng ký lịch họp" },
  },
  {
    path: "/meeting-manager",
    name: "meetingManager",
    component: MeetingManager,
    meta: { title: "Quản lý lịch họp" },
  },
  {
    path: "/meetings/:id/edit",
    name: "MeetingEdit",
    component: EditMeetingForm,
    props: true,
    meta: { title: "Sửa lịch họp" },
  },
  {
    path: "/meeting-calendar",
    name: "meetingCalendar",
    component: MeetingCalendarPage,
    meta: { title: "Lịch tháng" },
  },
];
