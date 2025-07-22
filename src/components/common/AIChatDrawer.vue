<template>
    <a-drawer v-model:open="visible" title="🧠 Trợ lý AI" placement="right" :width="400" @close="close">
        <div style="display: flex; flex-direction: column; height: 100%;">
            <!-- Khung chat -->
            <div ref="chatContainer" style="flex: 1; overflow-y: auto; padding: 12px; background-color: #f9f9f9;">
                <div v-for="(msg, index) in messages" :key="index"
                    :class="['chat-wrapper', msg.from === 'user' ? 'right' : 'left']">
                    <div :class="['chat-bubble', msg.from === 'user' ? 'user' : 'ai']">
                        <p><strong>{{ msg.from === 'user' ? 'Bạn' : '🤖 AI' }}:</strong> {{ msg.text }}</p>
                    </div>
                </div>
            </div>

            <!-- Ô nhập -->
            <div style="padding: 12px; border-top: 1px solid #f0f0f0; background: #fff;">
                <a-input-search :key="inputKey" v-model:value="userMessage" placeholder="Nhập nội dung..."
                    enter-button="Gửi" @search="sendMessage" :disabled="loading" />
            </div>
        </div>
    </a-drawer>
</template>



<script setup>
import { ref, watch, nextTick } from 'vue'
import { chatWithAI } from '@/services/aiService'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])

const visible = ref(false)
watch(() => props.open, val => visible.value = val)

const userMessage = ref('')

const messages = ref([{ from: 'ai', text: 'Xin chào! Tôi có thể giúp gì?' }])
const chatContainer = ref(null)
const loading = ref(false)

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

const sendMessage = async () => {
    const content = userMessage.value.trim()
    if (!content) return

    messages.value.push({ from: 'user', text: content })
    userMessage.value = ''
    scrollToBottom()

    loading.value = true
    try {
        const res = await chatWithAI([
            { role: 'system', content: 'Bạn là trợ lý AI thân thiện' },
            ...messages.value.map(m => ({
                role: m.from === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            { role: 'user', content }
        ])
        const reply = res.choices?.[0]?.message?.content || '🤖 Xin lỗi, tôi chưa hiểu.'
        messages.value.push({ from: 'ai', text: reply })
        userMessage.value = ''
    } catch (e) {
        messages.value.push({ from: 'ai', text: '⚠️ Lỗi: không thể gọi AI.' })
    } finally {
        loading.value = false
        scrollToBottom()
    }
}

const close = () => emit('update:open', false)
</script>

<style scoped>
.chat-wrapper {
    display: flex;
    margin-bottom: 10px;
}

.chat-wrapper.left {
    justify-content: flex-start;
}

.chat-wrapper.right {
    justify-content: flex-end;
}

.chat-bubble {
    padding: 10px 14px;
    border-radius: 16px;
    max-width: 75%;
    word-wrap: break-word;
}

.chat-bubble.ai {
    background-color: #e6f4ff;
    color: #000;
    text-align: left;
}

.chat-bubble.user {
    background-color: #C06252;
    color: white;
    text-align: right;
}
</style>
