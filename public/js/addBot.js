// public/js/addBot.js
function initAddBot() {
  const addBotForm = document.getElementById("add-bot-form");
  const botError = document.getElementById("bot-error");
  const botSuccess = document.getElementById("bot-success");

  // التأكد من وجود العناصر في الـ DOM
  if (!addBotForm) {
    console.error("Add bot form not found in the DOM");
    return;
  }

  // معالجة إرسال الفورم
  addBotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // تنظيف الرسائل السابقة
    if (botError) botError.textContent = "";
    if (botSuccess) botSuccess.textContent = "";

    // جمع البيانات من الفورم
    const formData = new FormData(addBotForm);
    const botData = {
      name: formData.get("name")?.trim(),
      username: formData.get("username")?.trim(),
      password: formData.get("password")?.trim(),
      fbToken: formData.get("fbToken")?.trim() || null,
      pageId: formData.get("pageId")?.trim() || null,
      openaiKey: formData.get("openaiKey")?.trim() || null,
    };

    // التحقق من الحقول المطلوبة
    if (!botData.name || !botData.username || !botData.password) {
      if (botError) botError.textContent = "يرجى إدخال جميع الحقول المطلوبة";
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        if (botError) botError.textContent = "يرجى تسجيل الدخول أولاً";
        return;
      }

      // إرسال الطلب للسيرفر
      const res = await fetch("/public/js/addBot.js"/bots/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(botData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "فشل في إنشاء البوت");
      }

      // نجاح العملية
      if (botSuccess) botSuccess.textContent = result.message || "تم إنشاء البوت بنجاح";
      addBotForm.reset(); // إعادة تعيين الفورم

    } catch (err) {
      console.error("خطأ في إنشاء البوت:", err);
      if (botError) botError.textContent = err.message || "حدث خطأ أثناء إنشاء البوت";
    }
  });
}

// التأكد من تهيئة التاب عند تحميل السكربت
if (document.readyState === "complete" || document.readyState === "interactive") {
  initAddBot();
} else {
  document.addEventListener("DOMContentLoaded", initAddBot);
}
