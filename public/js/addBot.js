function initAddBot() {
  const content = document.getElementById("main-content");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!content) {
    console.error('Main content element not found');
    return;
  }

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

    <div id="editBotForm" class="create-bot-form" style="display: none;">
      <h3>تعديل البوت</h3>
      <form id="editForm">
        <input type="text" id="editName" placeholder="اسم البوت" required />
        <input type="text" id="editUsername" placeholder="اسم المستخدم" required />
        <input type="password" id="editPassword" placeholder="كلمة المرور" required />
        <input type="text" id="editFbToken" placeholder="فيسبوك API" />
        <input type="text" id="editPageId" placeholder="Page ID" />
        <input type="text" id="editOpenAiKey" placeholder="مفتاح OpenAI" />
        <button type="submit">تحديث</button>
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

  const toggleBtn = document.getElementById("toggleFormBtn");
  const formContainer = document.getElementById("createBotForm");
  toggleBtn.addEventListener("click", () => {
    formContainer.style.display = formContainer.style.display === "block" ? "none" : "block";
  });

  const fbTokenInput = document.getElementById("fbToken");
  const pageIdInput = document.getElementById("pageId");
  fbTokenInput.addEventListener("input", () => {
    pageIdInput.style.display = fbTokenInput.value.trim() ? "block" : "none";
  });

  const form = document.getElementById("botForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("botName").value.trim(),
      username: document.getElementById("botUsername").value.trim(),
      password: document.getElementById("botPassword").value.trim(),
      fbToken: fbTokenInput.value.trim() || null,
      pageId: pageIdInput.value.trim() || null,
      openaiKey: document.getElementById("openAiKey").value.trim() || null,
    };

    const res = await fetch("/bots/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || "تم إنشاء البوت!");
      form.reset();
      formContainer.style.display = "none";
      loadBots();
    } else {
      alert(result.error || "خطأ في إنشاء البوت!");
    }
  });

  async function loadBots() {
    const botsList = document.getElementById("botsList");
    botsList.innerHTML = `<tr><td colspan="3">⏳ جاري التحميل...</td></tr>`;

    try {
      const res = await fetch("/bots", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bots = await res.json();
      if (!res.ok) {
        throw new Error(bots.error || "خطأ في جلب البوتات");
      }
      const filtered = role === "admin" ? bots : bots.filter(b => b.username === username);
      botsList.innerHTML = "";

      let selectedId = localStorage.getItem("currentBotId");

      filtered.forEach((bot, index) => {
        const tr = document.createElement("tr");
        tr.className = bot._id === selectedId ? "selected-bot-row" : "";

        const check = bot._id === selectedId ? "✅" : "";
        tr.innerHTML = `
          <td>${bot.name} ${check}</td>
          <td>${bot.username}</td>
          <td>
            <button onclick="selectBot('${bot._id}', '${bot.name}')">اختيار</button>
            ${role === "admin" ? `<button class="edit-btn" data-id="${bot._id}">تعديل</button>` : ""}
          </td>`;
        botsList.appendChild(tr);

        if (!selectedId && index === 0) {
          selectBot(bot._id, bot.name);
        }
      });

      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const res = await fetch(`/bots/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const bot = await res.json();
          if (res.ok) {
            openEditForm(bot);
          } else {
            alert(bot.error || "خطأ في جلب بيانات البوت");
          }
        });
      });

    } catch (err) {
      botsList.innerHTML = `<tr><td colspan="3">❌ خطأ في تحميل البوتات</td></tr>`;
      console.error("خطأ في تحميل البوتات:", err);
    }
  }

  window.selectBot = (id, name) => {
    localStorage.setItem("currentBotId", id);
    localStorage.setItem("currentBotName", name);
    initAddBot();
  };

  function openEditForm(bot) {
    document.getElementById("editBotForm").style.display = "block";
    document.getElementById("editName").value = bot.name;
    document.getElementById("editUsername").value = bot.username;
    document.getElementById("editPassword").value = bot.password;
    document.getElementById("editFbToken").value = bot.fbToken || "";
    document.getElementById("editPageId").value = bot.pageId || "";
    document.getElementById("editOpenAiKey").value = bot.openaiKey || "";

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const updated = {
        name: document.getElementById("editName").value,
        username: document.getElementById("editUsername").value,
        password: document.getElementById("editPassword").value,
        fbToken: document.getElementById("editFbToken").value,
        pageId: document.getElementById("editPageId").value,
        openaiKey: document.getElementById("editOpenAiKey").value,
      };

      const res = await fetch(`/bots/${bot._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "تم التحديث!");
        document.getElementById("editBotForm").style.display = "none";
        loadBots();
      } else {
        alert(result.error || "خطأ في تحديث البوت!");
      }
    };
  }

  loadBots();
}
