async function loadBotsPage() {
  const token = localStorage.getItem("token");
  const section = document.getElementById("dashboard-section");

  section.innerHTML = `<h2>البوتات</h2><div id="actions-container"></div><div id="bots-container">جاري التحميل...</div>`;

  try {
  const res = await fetch("/api/bots", {
  headers: { Authorization: `Bearer ${token}` },
});
    const bots = await res.json();

    const userInfo = parseJwt(token);
    const isAdmin = userInfo?.role === "admin";

    const grouped = {};

    bots.forEach((bot) => {
      const username = bot.user?.username || "غير معروف";
      if (!grouped[username]) grouped[username] = [];
      grouped[username].push(bot);
    });

    const botsContainer = document.getElementById("bots-container");
    let content = "";

    if (isAdmin) {
      document.getElementById("actions-container").innerHTML = `
        <button onclick="showCreateUserForm()">➕ مستخدم جديد</button>
        <button onclick="showCreateBotForm()">➕ بوت جديد</button>
      `;
    }

    for (const [username, userBots] of Object.entries(grouped)) {
      if (!isAdmin && username !== userInfo.username) continue;

      content += `<div class="user-block"><h3>👤 ${username}</h3>`;
      content += userBots
        .map((bot) => {
          return `
            <div class="bot-box">
              <strong>🤖 ${bot.name}</strong><br>
              ${bot.facebookPageId ? `📘 صفحة: ${bot.facebookPageId}<br>` : ""}
              ${isAdmin ? `<button onclick="deleteBot('${bot._id}')">🗑 حذف</button>` : ""}
            </div>
          `;
        })
        .join("");
      content += "</div>";
    }

    botsContainer.innerHTML = content || "<p>لا توجد بوتات متاحة</p>";
  } catch (err) {
    console.error("فشل في جلب البوتات:", err);
  }
}

function showCreateUserForm() {
  const container = document.getElementById("dashboard-section");
  container.innerHTML += `
    <div class="popup-form">
      <h3>إضافة مستخدم</h3>
      <input id="newUsername" placeholder="اسم المستخدم">
      <input id="newPassword" type="password" placeholder="كلمة المرور">
      <select id="newRole">
        <option value="user">مستخدم عادي</option>
        <option value="admin">سوبر أدمن</option>
      </select>
      <button onclick="createUser()">✅ إنشاء</button>
    </div>
  `;
}

async function createUser() {
  const token = localStorage.getItem("token");
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;

  try {
    const res = await fetch("/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    });

    if (res.ok) {
      alert("✅ تم إنشاء المستخدم");
      loadBotsPage();
    } else {
      const err = await res.json();
      alert("❌ فشل: " + err.error);
    }
  } catch (err) {
    console.error(err);
  }
}

function showCreateBotForm() {
  const container = document.getElementById("dashboard-section");
  container.innerHTML += `
    <div class="popup-form">
      <h3>إضافة بوت</h3>
      <input id="botName" placeholder="اسم البوت">
      <input id="facebookApiKey" placeholder="مفتاح فيسبوك (اختياري)" oninput="togglePageIdField()">
      <input id="facebookPageId" placeholder="معرف صفحة فيسبوك" style="display:none">
      <input id="botUsername" placeholder="اسم المستخدم المرتبط">
      <button onclick="createBot()">✅ إنشاء</button>
    </div>
  `;
}

function togglePageIdField() {
  const key = document.getElementById("facebookApiKey").value;
  const pageIdField = document.getElementById("facebookPageId");
  pageIdField.style.display = key ? "block" : "none";
}

async function createBot() {
  const token = localStorage.getItem("token");
  const name = document.getElementById("botName").value;
  const facebookApiKey = document.getElementById("facebookApiKey").value;
  const facebookPageId = document.getElementById("facebookPageId").value;
  const username = document.getElementById("botUsername").value;

  try {
    const res = await fetch("/bots", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        fbToken: facebookApiKey || undefined,
        pageId: facebookPageId || undefined,
        username,
      }),
    });

    if (res.ok) {
      alert("✅ تم إنشاء البوت");
      loadBotsPage();
    } else {
      const err = await res.json();
      alert("❌ فشل: " + err.error);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteBot(id) {
  const token = localStorage.getItem("token");
  if (!confirm("هل تريد حذف هذا البوت؟")) return;

  try {
    const res = await fetch(`/bots/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("🗑️ تم الحذف");
      loadBotsPage();
    } else {
      alert("❌ فشل الحذف");
    }
  } catch (err) {
    console.error(err);
  }
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}
