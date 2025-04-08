export function initAddBot() {
  const content = document.getElementById("main-content");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  content.innerHTML = `
    <button id="toggleFormBtn" class="toggle-form-btn">➕ إنشاء بوت جديد</button>
    <div id="createBotForm" class="create-bot-form" style="display: none;">
      <h3>إنشاء بوت جديد</h3>
      <form id="botForm">
        <input type="text" id="botName" placeholder="اسم البوت" required />
        <input type="text" id="botUsername" placeholder="اسم المستخدم" required />
        <input type="password" id="botPassword" placeholder="كلمة المرور" required />
        <input type="text" id="fbToken" placeholder="فيسبوك API (اختياري)" />
        <input type="text" id="pageId" placeholder="Page ID (اختياري)" style="display:none;" />
        <input type="text" id="openAiKey" placeholder="مفتاح OpenAI (اختياري)" />
        <button type="submit">إنشاء</button>
      </form>
    </div>

    <h3>البوتات الخاصة بك</h3>
    <table class="bots-table">
      <thead>
        <tr>
          <th>اسم البوت</th>
          <th>اسم المستخدم</th>
          <th>تحكم</th>
        </tr>
      </thead>
      <tbody id="botsList">
        <tr><td colspan="3">جاري التحميل...</td></tr>
      </tbody>
    </table>
  `;

  // Toggle الفورم
  const toggleBtn = document.getElementById("toggleFormBtn");
  const formContainer = document.getElementById("createBotForm");
  toggleBtn.addEventListener("click", () => {
    const visible = formContainer.style.display === "block";
    formContainer.style.display = visible ? "none" : "block";
  });

  // ديناميكية ظهور pageId
  const fbTokenInput = document.getElementById("fbToken");
  const pageIdInput = document.getElementById("pageId");
  fbTokenInput.addEventListener("input", () => {
    pageIdInput.style.display = fbTokenInput.value.trim() ? "block" : "none";
  });

  // إنشاء بوت
  const form = document.getElementById("botForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("botName").value.trim(),
      username: document.getElementById("botUsername").value.trim(),
      password: document.getElementById("botPassword").value.trim(),
      fbToken: fbTokenInput.value.trim() || null,
      pageId: pageIdInput.value.trim() || null,
      openAiKey: document.getElementById("openAiKey").value.trim() || null,
    };

    const res = await fetch("/bots/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message || "تم إنشاء البوت!");
    form.reset();
    formContainer.style.display = "none";
    loadBots();
  });

  // تحميل البوتات
  async function loadBots() {
    const botsList = document.getElementById("botsList");
    botsList.innerHTML = `<tr><td colspan="3">⏳ جاري التحميل...</td></tr>`;

    try {
      const res = await fetch("/bots");
      const bots = await res.json();

      const filtered = role === "admin" ? bots : bots.filter(b => b.username === username);

      if (filtered.length === 0) {
        botsList.innerHTML = `<tr><td colspan="3">🚫 لا توجد بوتات</td></tr>`;
        return;
      }

      botsList.innerHTML = "";
      filtered.forEach(bot => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${bot.name}</td>
          <td>${bot.username}</td>
          <td><button onclick="selectBot('${bot._id}', '${bot.name}')">اختيار</button></td>
        `;
        botsList.appendChild(tr);
      });
    } catch (err) {
      botsList.innerHTML = `<tr><td colspan="3">❌ خطأ في تحميل البوتات</td></tr>`;
    }
  }

  loadBots();
}

// لحفظ البوت المختار
window.selectBot = (id, name) => {
  localStorage.setItem("currentBotId", id);
  localStorage.setItem("currentBotName", name);
  alert(`✅ تم اختيار البوت: ${name}`);
};
