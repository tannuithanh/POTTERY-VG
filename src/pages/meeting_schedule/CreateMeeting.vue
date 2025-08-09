<template>
    <a-form layout="vertical" :model="form" :rules="rules" ref="formRef" @submit.prevent="onSubmit">
        <a-row :gutter="16">
            <!-- Phòng họp -->
            <a-col :span="12">
                <a-form-item label="Phòng họp" name="room" required>
                    <a-select v-model:value="form.room" placeholder="Chọn phòng họp" :showSearch="true"
                        optionFilterProp="label" :filterOption="filterByText" :loading="loadingRooms" allowClear>
                        <a-select-option v-for="room in meetingRooms" :key="room.id" :value="room.id"
                            :label="room.name">
                            {{ room.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Nội dung -->
            <a-col :span="12">
                <a-form-item label="Nội dung" name="title" required>
                    <a-input v-model:value="form.title" placeholder="Nội dung cuộc họp" />
                </a-form-item>
            </a-col>

            <!-- Thời gian -->
            <a-col :span="6">
                <a-form-item label="Thời gian bắt đầu" name="start_datetime" required>
                    <a-date-picker v-model:value="form.start_datetime" show-time format="YYYY-MM-DD HH:mm"
                        style="width: 100%" />
                </a-form-item>
            </a-col>
            <a-col :span="6">
                <a-form-item label="Thời gian kết thúc" name="end_datetime" required>
                    <a-date-picker v-model:value="form.end_datetime" show-time format="YYYY-MM-DD HH:mm"
                        style="width: 100%" />
                </a-form-item>
            </a-col>

            <!-- Người liên quan -->
            <a-col :span="12">
                <a-form-item label="Người liên quan trực tiếp" name="related_people">
                    <a-select v-model:value="form.related_people" mode="multiple" placeholder="Chọn người liên quan"
                        :showSearch="true" optionFilterProp="label" :filterOption="filterByText" :loading="loadingUsers"
                        allowClear>
                        <a-select-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name">
                            {{ u.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Thiết bị -->
            <a-col :span="12">
                <a-form-item label="Thiết bị" name="devices">
                    <a-input v-model:value="form.devices" placeholder="Ví dụ: Máy chiếu, Micro..." />
                </a-form-item>
            </a-col>

            <!-- Chuyên môn -->
            <a-col :span="12">
                <a-form-item label="Thành phần chuyên môn" name="specialists">
                    <a-select v-model:value="form.specialists" mode="multiple" :showSearch="true"
                        optionFilterProp="label" :filterOption="filterByText" :loading="loadingUsers" allowClear>
                        <a-select-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name">
                            {{ u.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Tư vấn -->
            <a-col :span="12">
                <a-form-item label="Thành phần tư vấn" name="advisors">
                    <a-select v-model:value="form.advisors" mode="multiple" :showSearch="true" optionFilterProp="label"
                        :filterOption="filterByText" :loading="loadingUsers" allowClear>
                        <a-select-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name">
                            {{ u.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Người quyết định -->
            <a-col :span="12">
                <a-form-item label="Người quyết định" name="decision_maker" required>
                    <a-select v-model:value="form.decision_maker" placeholder="Chọn người quyết định" :showSearch="true"
                        optionFilterProp="label" :filterOption="filterByText" :loading="loadingUsers" allowClear>
                        <a-select-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name">
                            {{ u.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Thư ký -->
            <a-col :span="12">
                <a-form-item label="Thư ký" name="secretary_user_id">
                    <a-select v-model:value="form.secretary_user_id" :showSearch="true" optionFilterProp="label"
                        :filterOption="filterByText" :loading="loadingUsers" allowClear>
                        <a-select-option v-for="u in users" :key="u.id" :value="u.id" :label="u.name">
                            {{ u.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>



            <!-- Chủ trì -->
            <a-col :span="12">
                <a-form-item label="Người chủ trì" name="moderator">
                    <a-input v-model:value="form.moderator" placeholder="Nhập tên người chủ trì" />
                </a-form-item>
            </a-col>

            <!-- Tệp đính kèm (chỉ 1 file) -->
            <a-col :span="12">
                <a-form-item label="Tệp đính kèm" name="attachment">
                    <a-upload :beforeUpload="beforeUpload" :maxCount="1" :multiple="false" :showUploadList="true"
                        :fileList="fileList" @remove="onRemoveFile">
                        <a-button icon="upload">Tải lên (Tối đa 8MB)</a-button>
                    </a-upload>
                </a-form-item>
            </a-col>

            <!-- Ghi chú -->
            <a-col :span="12">
                <a-form-item label="Ghi chú" name="note">
                    <a-textarea v-model:value="form.note" rows="2" placeholder="Ghi chú thêm nếu có" />
                </a-form-item>
            </a-col>

            <!-- Nơi ghi nhận -->
            <a-col :span="12">
                <a-form-item label="Nơi ghi nhận kết quả" name="result_record_location" required>
                    <a-select v-model:value="form.result_record_location" allowClear>
                        <a-select-option value="Biên bản cuộc họp">Biên bản cuộc họp</a-select-option>
                        <a-select-option value="Gửi email cuộc họp">Gửi email cuộc họp</a-select-option>
                        <a-select-option value="CAP tại biên bản báo cáo sự không phù hợp">
                            CAP tại biên bản báo cáo sự không phù hợp
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>
        </a-row>

        <a-divider />

        <div class="text-end mt-4">
            <a-button type="primary" :loading="submitting" @click="onSubmit">
                <template #icon>
                    <CalendarOutlined />
                </template>
                Đăng ký lịch họp
            </a-button>
        </div>
    </a-form>
</template>

<script setup>
import { ref, onMounted, h } from "vue";
import dayjs from "dayjs";
import { notification } from "ant-design-vue";
import roomService from "@/services/meeting_schedule_service/roomService";
import userService from "@/services/userService";
import meetingRoomService from "@/services/meeting_schedule_service/meetingService";

const formRef = ref(null);
const loadingRooms = ref(false);
const loadingUsers = ref(false);
const submitting = ref(false);

const meetingRooms = ref([]);
const users = ref([]);

const form = ref(blankForm());
const fileList = ref([]); // chỉ 1 file

function blankForm() {
    return {
        room: null,
        title: "",
        start_datetime: dayjs(),
        end_datetime: dayjs().add(1, "hour"),
        related_people: [],
        devices: "",
        specialists: [],
        advisors: [],
        decision_maker: null,
        secretary_user_id: null,   // ✅ thêm dòng này
        moderator: "",
        note: "",
        result_record_location: "",
    };
}


const rules = {
    title: [{ required: true, message: "Tiêu đề là bắt buộc" }],
    room: [{ required: true, message: "Phải chọn phòng họp" }],
    start_datetime: [{ required: true, message: "Chọn thời gian bắt đầu" }],
    end_datetime: [{ required: true, message: "Chọn thời gian kết thúc" }],
    decision_maker: [{ required: true, message: "Phải chọn người quyết định" }],
    result_record_location: [{ required: true, message: "Phải nhập nơi lưu kết quả" }],
    related_people: [
        {
            validator: (_, value) =>
                value && value.length > 0
                    ? Promise.resolve()
                    : Promise.reject("Phải chọn ít nhất một người liên quan"),
        },
    ],
};

onMounted(async () => {
    await Promise.all([loadRooms(), loadUsers()]);
});

async function loadRooms() {
    try {
        loadingRooms.value = true;
        const res = await roomService.getAll();
        meetingRooms.value = res.data?.data ?? res.data ?? [];
    } catch (e) {
        notification.error({ message: "Lỗi tải phòng họp", description: "Không tải được danh sách phòng họp" });
    } finally {
        loadingRooms.value = false;
    }
}

async function loadUsers() {
    try {
        loadingUsers.value = true;
        const res = await userService.getAll();
        users.value = res.data?.data ?? res.data ?? [];
    } catch (e) {
        notification.error({ message: "Lỗi tải người dùng", description: "Không tải được danh sách người dùng" });
    } finally {
        loadingUsers.value = false;
    }
}

const strip = (s) => s?.toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const filterByText = (input, option) => {
    const text = strip(option?.label ?? option?.children);
    return text?.includes(strip(input));
};

// chỉ cho 1 file
const beforeUpload = (file) => {
    const isLt8M = file.size / 1024 / 1024 < 8;
    if (!isLt8M) {
        notification.error({ message: "Tệp quá lớn", description: "Dung lượng tệp vượt quá 8MB!" });
        return false;
    }
    fileList.value = [file];
    return false; // chặn auto-upload
};

const onRemoveFile = () => {
    fileList.value = [];
};

// ====== Validate helpers ======
function validateDateTime() {
    const sameDay =
        dayjs(form.value.start_datetime).format("YYYY-MM-DD") ===
        dayjs(form.value.end_datetime).format("YYYY-MM-DD");
    if (!sameDay) throw new Error("Ngày bắt đầu và kết thúc phải giống nhau");
    if (dayjs(form.value.start_datetime).isAfter(form.value.end_datetime)) {
        throw new Error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
    }
}

function validateRoles() {
  const all = [
    ...(form.value.related_people || []),
    ...(form.value.specialists || []),
    ...(form.value.advisors || []),
  ];
  if (form.value.decision_maker) all.push(form.value.decision_maker);
  if (form.value.secretary_user_id) all.push(form.value.secretary_user_id);

  const uniq = new Set(all);
  if (uniq.size !== all.length) throw new Error("Một người không được chọn trùng vai trò");
}


// Build payload POST
function buildPayload() {
    const toNumArr = (arr) => (Array.isArray(arr) ? arr.map((x) => Number(x)) : []);
    return {
        room_id: Number(form.value.room),
        title: form.value.title,
        start_at: dayjs(form.value.start_datetime).format("YYYY-MM-DD HH:mm:ss"),
        end_at: dayjs(form.value.end_datetime).format("YYYY-MM-DD HH:mm:ss"),
        registered_date: dayjs().format("YYYY-MM-DD"),
        room_devices: form.value.devices
            ? form.value.devices.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        stakeholder_user_ids: toNumArr(form.value.related_people),
        specialist_user_ids: toNumArr(form.value.specialists),
        advisor_user_ids: toNumArr(form.value.advisors),
        decision_maker_user_id: form.value.decision_maker ? Number(form.value.decision_maker) : null,
        secretary_user_id: form.value.secretary_user_id ? Number(form.value.secretary_user_id) : null, // ✅ thêm dòng này
        chairperson_name: form.value.moderator || "",
        notes: form.value.note || "",
        result_location: form.value.result_record_location || "",
    };
}


function handleSubmitError(e) {
    console.error(e);
    if (e?.response?.status === 422 && e?.response?.data?.errors) {
        const errorsObj = e.response.data.errors;
        const messages = Object.values(errorsObj).flat().join("<br>");
        notification.error({ message: "Lỗi gửi form", description: h("div", { innerHTML: messages }) });
        const fields = Object.entries(errorsObj).map(([name, errs]) => ({ name, errors: errs }));
        formRef.value?.setFields?.(fields);
    } else {
        notification.error({
            message: "Lỗi gửi form",
            description: e?.response?.data?.message || e?.message || "Gửi form thất bại",
        });
    }
}

function resetForm() {
    form.value = blankForm();
    fileList.value = [];
}

async function onSubmit() {
    try {
        submitting.value = true;
        await formRef.value?.validate?.();

        // validate custom
        try {
            validateDateTime();
            validateRoles();
        } catch (msg) {
            notification.error({ message: "Lỗi", description: String(msg) });
            return;
        }

        const payload = buildPayload();

        // CREATE
        const created = await meetingRoomService.create(payload);
        const meetingId = created?.id ?? created?.data?.id ?? created?.meeting?.id;

        // Upload 1 file nếu có
        if (meetingId && fileList.value.length) {
            await meetingRoomService.uploadFile(meetingId, fileList.value[0]);
        }

        notification.success({ message: "Thành công", description: "Đăng ký lịch họp thành công!" });
        resetForm();
    } catch (e) {
        handleSubmitError(e);
    } finally {
        submitting.value = false;
    }
}
</script>
