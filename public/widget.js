"use strict";var SiteBotWidget=(()=>{function b(){let s=document.currentScript,t=(s==null?void 0:s.getAttribute("data-chatbot-id"))||"",e=(s==null?void 0:s.getAttribute("data-api-url"))||"https://xelochat-production.up.railway.app";return{chatbotId:t,apiUrl:e,botName:(s==null?void 0:s.getAttribute("data-bot-name"))||"SiteBot",tagline:(s==null?void 0:s.getAttribute("data-tagline"))||"AI-powered assistant",primaryColor:(s==null?void 0:s.getAttribute("data-primary-color"))||"#3b82f6",position:(s==null?void 0:s.getAttribute("data-position"))||"bottom-right"}}var c=`
:host {
  --sb-primary: var(--sitebot-primary, #3b82f6);
  --sb-primary-dark: var(--sitebot-primary-dark, #2563eb);
  --sb-bg: #ffffff;
  --sb-text: #1e293b;
  --sb-muted: #64748b;
  --sb-border: hsl(214 32% 91%);
  --sb-user-bg: var(--sb-primary);
  --sb-user-text: #ffffff;
  --sb-assistant-bg: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.sb-widget {
  position: fixed;
  z-index: 2147483647;
}

.sb-widget.bottom-right {
  bottom: 24px;
  right: 24px;
}

.sb-widget.bottom-left {
  bottom: 24px;
  left: 24px;
}

/* FAB Button */
.sb-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--sb-primary) 0%, var(--sb-primary-dark) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sb-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.sb-fab:active {
  transform: scale(0.96);
}

.sb-fab svg {
  width: 22px;
  height: 22px;
}

/* Chat Panel */
.sb-panel {
  position: absolute;
  width: 420px;
  max-width: calc(100vw - 48px);
  height: min(640px, 78vh);
  max-height: calc(100vh - 48px);
  background: var(--sb-bg);
  border-radius: 24px;
  box-shadow:
    0 28px 60px -18px rgba(15, 23, 42, 0.28),
    0 10px 24px -12px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  animation: sb-slide-up 0.45s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.sb-widget.bottom-right .sb-panel {
  bottom: 72px;
  right: 0;
}

.sb-widget.bottom-left .sb-panel {
  bottom: 72px;
  left: 0;
}

@keyframes sb-slide-up {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.94);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.sb-panel.hidden {
  display: none;
}

/* Header */
.sb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px;
  background: var(--sb-bg);
  border-bottom: 1px solid hsl(214 32% 91%);
  flex-shrink: 0;
}

.sb-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sb-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sb-primary) 0%, var(--sb-primary-dark) 100%);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.sb-avatar svg {
  width: 20px;
  height: 20px;
}

.sb-bot-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--sb-text);
  line-height: 1.2;
}

.sb-tagline {
  font-size: 13px;
  color: var(--sb-muted);
  margin-top: 2px;
}

.sb-header-actions {
  display: flex;
  gap: 4px;
}

.sb-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.sb-action-btn:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.sb-action-btn svg {
  width: 18px;
  height: 18px;
}

/* Messages */
.sb-messages {
  flex: 1;
  overflow-y: auto;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sb-message {
  display: flex;
  width: 100%;
}

.sb-message.user {
  justify-content: flex-end;
}

.sb-message.assistant {
  justify-content: flex-start;
}

.sb-bubble {
  padding: 13px 18px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.5;
  max-width: 85%;
  word-break: break-word;
}

.sb-message.user .sb-bubble {
  background: var(--sb-user-bg);
  color: var(--sb-user-text);
  border-bottom-right-radius: 12px;
}

.sb-message.assistant .sb-bubble {
  background: var(--sb-assistant-bg);
  color: var(--sb-text);
  border: 1px solid hsl(214 32% 91%);
  border-bottom-left-radius: 12px;
}

.sb-bubble strong {
  font-weight: 600;
}

/* Typing indicator */
.sb-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.sb-typing span {
  width: 8px;
  height: 8px;
  background: var(--sb-muted);
  border-radius: 50%;
  animation: sb-bounce 1.4s infinite ease-in-out both;
}

.sb-typing span:nth-child(1) { animation-delay: -0.32s; }
.sb-typing span:nth-child(2) { animation-delay: -0.16s; }

@keyframes sb-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Input area */
.sb-input-area {
  display: flex;
  gap: 10px;
  padding: 18px 22px;
  background: var(--sb-bg);
  border-top: 1px solid hsl(214 32% 91%);
}

.sb-input {
  flex: 1;
  padding: 13px 18px;
  border: 1px solid hsl(214 32% 91%);
  border-radius: 12px;
  font-size: 15px;
  background: hsl(214 32% 98%);
  color: var(--sb-text);
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.sb-input:focus {
  border-color: var(--sb-primary);
  background: var(--sb-bg);
  box-shadow: 0 0 0 3px hsl(217 91% 60% / 0.1);
}

.sb-input::placeholder {
  color: var(--sb-muted);
}

.sb-send-btn {
  width: 50px;
  height: 50px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}

.sb-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsl(217 91% 45% / 0.3);
}

.sb-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-send-btn svg {
  width: 20px;
  height: 20px;
}

/* Legal bar */
.sb-legal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: hsl(214 32% 98%);
  border-top: 1px solid hsl(214 32% 93%);
  font-size: 11px;
  color: var(--sb-muted);
}

.sb-legal a {
  color: var(--sb-primary);
  text-decoration: none;
  font-weight: 500;
}

.sb-legal .sb-legal-separator {
  margin: 0 6px;
  color: var(--sb-muted);
}

.sb-legal a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .sb-panel {
    position: fixed;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .sb-fab {
    width: 52px;
    height: 52px;
  }
  
  .sb-widget.bottom-right,
  .sb-widget.bottom-left {
    bottom: 16px;
    right: 16px;
    left: auto;
  }
}
`,r={chat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M8 10.5h8M8 14.5h5" stroke-linecap="round"/>
    <path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1l-.6 3.9 4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z" stroke-linejoin="round"/>
  </svg>`,close:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,minimize:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,send:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>`,bot:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`},n=class{constructor(t){this.isOpen=!1;this.messages=[];this.isTyping=!1;this.clinicData=null;this.config=t,this.container=document.createElement("div"),this.container.id="sitebot-widget-root",this.shadow=this.container.attachShadow({mode:"closed"});let e=document.createElement("style");e.textContent=c,this.shadow.appendChild(e),this.render(),document.body.appendChild(this.container),this.addMessage("assistant",`Welcome! \u{1F44B} I'm ready to help you with any questions about this business.

What would you like to know?`),this.fetchClinicData()}async fetchClinicData(){var t;if(this.config.chatbotId)try{let e=await fetch(`${this.config.apiUrl}/api/chatbot/${this.config.chatbotId}`);if(e.ok){let i=await e.json();this.clinicData=i.clinicData,(t=i.settings)!=null&&t.botName&&(this.config.botName=i.settings.botName,this.render())}}catch(e){console.warn("SiteBot: Could not fetch chatbot data",e)}}render(){let t=document.createElement("div");if(t.className=`sb-widget ${this.config.position}`,this.config.primaryColor){t.style.setProperty("--sitebot-primary",this.config.primaryColor);let a=this.darkenColor(this.config.primaryColor,15);t.style.setProperty("--sitebot-primary-dark",a)}let e=document.createElement("button");e.className="sb-fab",e.innerHTML=r.chat,e.setAttribute("aria-label","Open chat"),e.onclick=()=>this.toggle();let i=document.createElement("div");i.className=`sb-panel ${this.isOpen?"":"hidden"}`,i.innerHTML=this.renderPanel(),t.appendChild(i),t.appendChild(e);let o=this.shadow.querySelector(".sb-widget");o&&o.remove(),this.shadow.appendChild(t),this.attachEventListeners()}renderPanel(){return`
      <header class="sb-header">
        <div class="sb-header-info">
          <div class="sb-avatar">${r.bot}</div>
          <div>
            <div class="sb-bot-name">${this.escapeHtml(this.config.botName||"SiteBot")}</div>
            <div class="sb-tagline">${this.escapeHtml(this.config.tagline||"AI-powered assistant")}</div>
          </div>
        </div>
        <div class="sb-header-actions">
          <button class="sb-action-btn sb-minimize" aria-label="Minimize">${r.minimize}</button>
          <button class="sb-action-btn sb-close" aria-label="Close">${r.close}</button>
        </div>
      </header>
      <div class="sb-messages">
        ${this.renderMessages()}
      </div>
      <div class="sb-input-area">
        <input type="text" class="sb-input" placeholder="Ask anything..." ${this.isTyping?"disabled":""}>
        <button class="sb-send-btn" ${this.isTyping?"disabled":""}>${r.send}</button>
      </div>
      <div class="sb-legal">
        <span>AI responses are informational and may be imperfect.</span>
        <div>
          <a href="#" target="_blank">Terms</a>
          <span class="sb-legal-separator">\u2022</span>
          <a href="#" target="_blank">Privacy</a>
        </div>
      </div>
    `}renderMessages(){let t=this.messages.map(e=>`
      <div class="sb-message ${e.role}">
        <div class="sb-bubble">${this.formatMessage(e.content)}</div>
      </div>
    `).join("");return this.isTyping&&(t+=`
        <div class="sb-message assistant">
          <div class="sb-bubble">
            <div class="sb-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `),t}attachEventListeners(){let t=this.shadow.querySelector(".sb-close"),e=this.shadow.querySelector(".sb-minimize"),i=this.shadow.querySelector(".sb-send-btn"),o=this.shadow.querySelector(".sb-input");t==null||t.addEventListener("click",a=>{a.stopPropagation(),this.close()}),e==null||e.addEventListener("click",a=>{a.stopPropagation(),this.close()}),i==null||i.addEventListener("click",()=>this.sendMessage()),o==null||o.addEventListener("keypress",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),this.sendMessage())})}toggle(){this.isOpen=!this.isOpen,this.render(),this.isOpen&&setTimeout(()=>{let t=this.shadow.querySelector(".sb-input");t==null||t.focus(),this.scrollToBottom()},100)}close(){this.isOpen=!1,this.render()}async sendMessage(){let t=this.shadow.querySelector(".sb-input"),e=t==null?void 0:t.value.trim();if(!(!e||this.isTyping)){t.value="",this.addMessage("user",e),this.isTyping=!0,this.render(),this.scrollToBottom();try{let i=await this.callChatAPI(e);this.addMessage("assistant",i)}catch(i){this.addMessage("assistant","Sorry, I encountered an error. Please try again."),console.error("SiteBot chat error:",i)}this.isTyping=!1,this.render(),this.scrollToBottom()}}async callChatAPI(t){if(!this.config.chatbotId)return"This chatbot is not configured yet. Please contact the website owner.";let e=await fetch(`${this.config.apiUrl}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chatbotId:this.config.chatbotId,message:t,conversationHistory:this.messages.slice(0,-1)})});if(!e.ok)throw new Error(`HTTP ${e.status}`);let i=await e.json();return i.response||i.message||"I could not process that request."}addMessage(t,e){this.messages.push({role:t,content:e})}scrollToBottom(){setTimeout(()=>{let t=this.shadow.querySelector(".sb-messages");t&&(t.scrollTop=t.scrollHeight)},50)}formatMessage(t){return this.escapeHtml(t).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>")}escapeHtml(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}darkenColor(t,e){let i=parseInt(t.replace("#",""),16),o=Math.round(2.55*e),a=Math.max((i>>16)-o,0),d=Math.max((i>>8&255)-o,0),l=Math.max((i&255)-o,0);return`#${(16777216+a*65536+d*256+l).toString(16).slice(1)}`}};(function(){let s=b();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new n(s)):new n(s)})();window.SiteBotWidget=n;})();
