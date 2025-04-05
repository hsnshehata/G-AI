document.addEventListener("DOMContentLoaded", () => {
  const questionInput = document.getElementById("question");
  const answerInput = document.getElementById("answer");
  const faqForm = document.getElementById("faq-form");
  const faqBody = document.getElementById("faq-body");
  const searchInput = document.getElementById("faq-search");
  const exportBtn = document.getElementById("export-faqs");

  let faqs = [];

  // ✅ تحميل الأسئلة
  const loadFAQs = async () => {
    try {
      const res = await fetch("/faqs");
      faqs = await res.json();
      renderFAQs();
    } catch (err) {
      console.error("❌ Error loading FAQs:", err);
    }
  };

  // ✅ عرض الأسئلة
  const renderFAQs = () => {
    faqBody.innerHTML = "";

    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    filtered.forEach((faq, index) => {
      const row = document.createElement("div");
      row.className = "faq-item";

      row.innerHTML = `
        <div class="faq-question">${faq.question}</div>
        <div class="faq-answer">${faq.answer}</div>
        <div class="faq-actions">
          <button onclick="toggleFAQ(${index})">
            ${faq.active ? "🔓 تعطيل" : "🔒 تفعيل"}
          </button>
          <button onclick="deleteFAQ(${index})">🗑️ حذف</button>
        </div>
      `;

      faqBody.appendChild(row);
    });
  };

  // ✅ إضافة سؤال
  faqForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    if (!question || !answer) return;

    try {
      await fetch("/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      questionInput.value = "";
      answerInput.value = "";
      await loadFAQs();
    } catch (err) {
      console.error("❌ Error adding FAQ:", err);
    }
  });

  // ✅ حذف سؤال
  window.deleteFAQ = async (index) => {
    const faq = faqs[index];
    if (!faq || !confirm("هل أنت متأكد أنك تريد الحذف؟")) return;

    try {
      await fetch(`/faqs/${faq._id}`, { method: "DELETE" });
      await loadFAQs();
    } catch (err) {
      console.error("❌ Error deleting FAQ:", err);
    }
  };

  // ✅ تفعيل/تعطيل
  window.toggleFAQ = async (index) => {
    const faq = faqs[index];
    if (!faq) return;

    try {
      await fetch(`/faqs/${faq._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !faq.active }),
      });
      await loadFAQs();
    } catch (err) {
      console.error("❌ Error toggling FAQ:", err);
    }
  };

  // ✅ بحث حي
  searchInput.addEventListener("input", renderFAQs);

  // ✅ تصدير كـ JSON
  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(faqs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faqs.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // 🪄 زر اقتراح إجابة تلقائية باستخدام GPT
  const suggestBtn = document.getElementById("suggest-answer");

  suggestBtn.addEventListener("click", async () => {
    const question = questionInput.value.trim();
    if (!question) return alert("من فضلك أدخل السؤال أولاً");

    try {
      suggestBtn.textContent = "⏳ جاري الاقتراح...";
      const res = await fetch("/faqs/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (data.answer) {
        answerInput.value = data.answer;
      } else {
        alert("لم يتم التوصل لإجابة مناسبة.");
      }
    } catch (err) {
      console.error("❌ Error suggesting answer:", err);
      alert("حدث خطأ أثناء اقتراح الإجابة.");
    } finally {
      suggestBtn.textContent = "🪄 اقتراح إجابة تلقائية";
    }
  });

  loadFAQs();
});
