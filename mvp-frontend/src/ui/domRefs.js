// DOM element references — resolved once at module load time.
// The script tag is at the end of <body>, so all elements exist when this runs.

export const app             = document.getElementById('app')
export const chatArea        = document.getElementById('chat-area')
export const stageBadgeSlot  = document.getElementById('stage-badge-slot')
export const quickRepliesArea = document.getElementById('quick-replies-area')
export const msgInput        = document.getElementById('msg-input')
export const sendBtn         = document.getElementById('send-btn')
export const typingEl        = document.getElementById('typing-indicator')
