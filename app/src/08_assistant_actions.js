/* Ações do assistente (carregado depois de 07_actions) */
function chatPush(s, userText, replies) {
  if (userText) App.ui.chat.push({ who: "me", text: userText });
  replies.forEach(m => App.ui.chat.push({ ...m, who: "bot" }));
  if (App.ui.chat.length > 60) App.ui.chat = App.ui.chat.slice(-60);
}
Object.assign(Actions, {
  chat(el) {
    const s = me(); const kind = el.dataset.kind, arg = el.dataset.arg, label = el.textContent.trim();
    if (kind === "go") { const [page, tab] = arg.split(":"); if (tab) App.ui.resumeTab = tab; return App.go(page); }
    if (kind === "app") { chatPush(s, label, []); App.render(); return Actions.openApp({ dataset: { id: arg } }); }
    const [intent, a2] = arg.split(":");
    chatPush(s, label, Assistant.reply(s, intent, a2)); App.render();
  },
  chatReset() { App.ui.chat = null; App.render(); },
});
Forms.chat = (f) => {
  const s = me(); const text = val("chat-text"); if (!text) return;
  const [intent, arg] = Assistant.parse(text);
  chatPush(s, text, Assistant.reply(s, intent, arg)); App.render();
  document.getElementById("chat-text")?.focus();
};
(function () { const base = App.render.bind(App); App.render = function () { base(); const log = document.getElementById("chat-log"); if (log) log.scrollTop = log.scrollHeight; }; })();
