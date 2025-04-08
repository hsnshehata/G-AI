function initAddBot() {
  const container = document.getElementById("botsSection");
  container.innerHTML = ""; // تفريغ المحتوى قبل التحميل الجديد

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "user"; // لو عندنا تخزين مسبق

  // إنشاء جدول عرض البوتات
  const table = document.createElement("table");
  table.classList.add("bots-table");
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>اسم البوت</th>
      <th>اسم المستخدم</th>
      <th>التحكم</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  container.appendChild(table);

  // زر إنشاء بوت (للأدمن فقط)
  if (role === "admin") {
    const formBox = document.createElement("div");
    formBox.className = "create-bot-form";
    formBox.innerHTML = `
      <h3>إنشاء بوت جديد</h3>
      <form id="botForm">
        <input type="text" id="botName" placeholder="اسم البوت" required />
        <input type="text" id="username" placeholder="اسم المستخدم" required />
        <input type="password" id="password" placeholder="كلمة المرور" required />
        <input type="text" id="fbToken" placeholder="فيسبوك API (اختياري)" />
        <input type="text" id="pageId" placeholder="Page ID (يظهر تلقائيًا)" style="display:none;" />
        <input type="text" id="openAiKey" placeholder="مفتاح OpenAI (اختياري)" />
        <button type="submit">إنشاء</button>
      </form>
    `;
    container.prepend(formBox);

    const fbTokenInput = formBox.querySelector("#fbToken");
    const pageIdInput = formBox.querySelector("#pageId");
    fbTokenInput.addEventListener("input", () => {
      pageIdInput.style.display = fbTokenInput.value ? "block" : "none";
    });

    formBox.querySelector("#botForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = {
        name: document.getElementById("botName").value,
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        fbToken: document.getElementById("fbToken").value,
        pageId: document.getElementById("pageId").value,
        openAiKey: document.getElementById("openAiKey").value,
      };

      try {
        const res = await fetch("/bots/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        alert(data.message || "تم إنشاء البوت بنجاح");
        initAddBot(); // إعادة تحميل البوتات
      } catch (err) {
        alert("حدث خطأ أثناء إنشاء البوت");
      }
    });
  }

  // تحميل البوتات من السيرفر
  fetch("/bots")
    .then((res) => res.json())
    .then((bots) => {
      const filteredBots = role === "admin"
        ? bots
        : bots.filter((b) => b.username === username);

      if (filteredBots.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">لا يوجد بوتات حتى الآن</td></tr>`;
        return;
      }

      filteredBots.forEach((bot) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${bot.name}</td>
          <td>${bot.username}</td>
          <td>
            <button onclick="selectBot('${bot._id}', '${bot.name}')">الدخول</button>
          </td>`;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="3">فشل في تحميل البوتات</td></tr>`;
    });
}

// وظيفة اختيار البوت
function selectBot(botId, botName) {
  localStorage.setItem("currentBotId", botId);
  localStorage.setItem("currentBotName", botName);
  alert(`تم اختيار البوت: ${botName}`);
}
