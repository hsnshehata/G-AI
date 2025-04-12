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
      const username = bot.userId?.username || "غير معروف";
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
      content += userBots.map(bot => `
        <div class="bot-box">
          <strong>🤖 ${bot.name}</strong><br>
          ${bot.facebookPageId ? `📘 صفحة: ${bot.facebookPageId}<br>` : ""}
          ${isAdmin ? `<button onclick="deleteBot('${bot._id}')">🗑 حذف</button>` : ""}
        </div>
      `).join("");
      content += "</div>";
    }

    botsContainer.innerHTML = content || "<p>لا توجد بوتات متاحة</p>";
  } catch (err) {
    console.error("فشل في جلب البوتات:", err);
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
    const resUser = await fetch(`/api/users/username/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = await resUser.json();
    if (!resUser.ok || !user._id) {
      alert("❌ لم يتم العثور على المستخدم");
      return;
    }

    const res = await fetch("/api/bots", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        facebookApiKey: facebookApiKey || undefined,
        facebookPageId: facebookPageId || undefined,
        userId: user._id,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ تم إنشاء البوت");
      loadBotsPage();
    } else {
      alert("❌ فشل الإنشاء: " + data.message);
    }
  } catch (err) {
    console.error("خطأ أثناء إنشاء البوت:", err);
  }
}

async function deleteBot(id) {
  const token = localStorage.getItem("token");
  if (!confirm("هل تريد حذف هذا البوت؟")) return;

  try {
    const res = await fetch(`/api/bots/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      alert("🗑️ تم الحذف");
      loadBotsPage();
    } else {
      alert("❌ فشل الحذف: " + data.message);
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
