export function initRules() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <section class="card">
      <h2>إدارة القواعد</h2>
      <div class="top-tabs">
        <button class="tab-button" id="generalRulesBtn">قواعد عامة (للسوبر أدمن)</button>
        <button class="tab-button" id="botSpecificRulesBtn">قواعد خاصة بهذا البوت</button>
        <button class="tab-button" id="faqRulesBtn">أسئلة وأجوبة</button>
        <button class="tab-button" id="productRulesBtn">منتجات وأسعار</button>
        <button class="tab-button" id="storeLinkBtn">ربط المتجر</button>
      </div>
      
      <div id="generalRulesTab" class="tab-section" style="display:none;">
        <h3>قواعد عامة</h3>
        <textarea id="generalRulesText" class="create-bot-form input" placeholder="أدخل القواعد العامة هنا..." rows="4" required></textarea>
        <button id="saveGeneralRulesBtn" class="action-button">حفظ القواعد العامة</button>
      </div>

      <div id="botSpecificRulesTab" class="tab-section" style="display:none;">
        <h3>قواعد خاصة بالبوت</h3>
        <textarea id="botSpecificRulesText" class="create-bot-form input" placeholder="أدخل القواعد الخاصة بالبوت هنا..." rows="4" required></textarea>
        <button id="saveBotSpecificRulesBtn" class="action-button">حفظ القواعد الخاصة بالبوت</button>
      </div>

      <div id="faqRulesTab" class="tab-section" style="display:none;">
        <h3>أسئلة وأجوبة</h3>
        <input type="text" id="faqQuestion" class="create-bot-form input" placeholder="أدخل السؤال هنا..." required />
        <input type="text" id="faqAnswer" class="create-bot-form input" placeholder="أدخل الإجابة هنا..." required />
        <button id="saveFaqRulesBtn" class="action-button">حفظ الأسئلة والأجوبة</button>
      </div>

      <div id="productRulesTab" class="tab-section" style="display:none;">
        <h3>منتجات وأسعار</h3>
        <input type="text" id="productName" class="create-bot-form input" placeholder="اسم المنتج" required />
        <input type="number" id="productPrice" class="create-bot-form input" placeholder="السعر" required />
        <button id="saveProductBtn" class="action-button">حفظ المنتج والسعر</button>
      </div>

      <div id="storeLinkTab" class="tab-section" style="display:none;">
        <h3>ربط المتجر</h3>
        <input type="text" id="storeApiKey" class="create-bot-form input" placeholder="مفتاح API للمتجر" required />
        <button id="saveStoreLinkBtn" class="action-button">حفظ ربط المتجر</button>
      </div>
    </section>
  `;

  // أزرار التبديل بين التبويبات
  document.getElementById("generalRulesBtn").addEventListener("click", () => toggleTab('generalRules'));
  document.getElementById("botSpecificRulesBtn").addEventListener("click", () => toggleTab('botSpecificRules'));
  document.getElementById("faqRulesBtn").addEventListener("click", () => toggleTab('faqRules'));
  document.getElementById("productRulesBtn").addEventListener("click", () => toggleTab('productRules'));
  document.getElementById("storeLinkBtn").addEventListener("click", () => toggleTab('storeLink'));

  // دالة لتبديل التبويبات
  function toggleTab(tabName) {
    const tabs = ['generalRules', 'botSpecificRules', 'faqRules', 'productRules', 'storeLink'];
    tabs.forEach(tab => {
      const tabElement = document.getElementById(tab + 'Tab');
      tabElement.style.display = tab === tabName ? 'block' : 'none';
    });

    // تحديث حالة الأزرار
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(button => {
      button.classList.remove("active");
      if (button.id === `${tabName}Btn`) {
        button.classList.add("active");
      }
    });
  }

  // حفظ القواعد العامة
  document.getElementById("saveGeneralRulesBtn").addEventListener("click", async () => {
    const text = document.getElementById('generalRulesText').value;
    await saveRule(text, 'general');
  });

  // حفظ القواعد الخاصة بالبوت
  document.getElementById("saveBotSpecificRulesBtn").addEventListener("click", async () => {
    const text = document.getElementById('botSpecificRulesText').value;
    await saveRule(text, 'bot');
  });

  // حفظ الأسئلة والأجوبة
  document.getElementById("saveFaqRulesBtn").addEventListener("click", async () => {
    const question = document.getElementById('faqQuestion').value;
    const answer = document.getElementById('faqAnswer').value;
    await saveFaq(question, answer);
  });

  // حفظ المنتجات والأسعار
  document.getElementById("saveProductBtn").addEventListener("click", async () => {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    await saveProduct(name, price);
  });

  // ربط المتجر
  document.getElementById("saveStoreLinkBtn").addEventListener("click", async () => {
    const apiKey = document.getElementById('storeApiKey').value;
    await linkStore(apiKey);
  });

  // دالة لحفظ القاعدة
  async function saveRule(text, type) {
    try {
      const response = await fetch('/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type }),
      });
      const result = await response.json();
      console.log('قاعدة تم حفظها:', result);
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ القاعدة:', error);
    }
  }

  // دالة لحفظ الأسئلة والأجوبة
  async function saveFaq(question, answer) {
    try {
      const response = await fetch('/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      const result = await response.json();
      console.log('تم حفظ السؤال والإجابة:', result);
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ السؤال والإجابة:', error);
    }
  }

  // دالة لحفظ المنتجات
  async function saveProduct(name, price) {
    try {
      const response = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price }),
      });
      const result = await response.json();
      console.log('منتج تم حفظه:', result);
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ المنتج:', error);
    }
  }

  // دالة لربط المتجر
  async function linkStore(apiKey) {
    try {
      const response = await fetch('/store-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const result = await response.json();
      console.log('تم ربط المتجر:', result);
    } catch (error) {
      console.error('حدث خطأ أثناء ربط المتجر:', error);
    }
  }

  // تعيين التبويب الافتراضي عند التحميل
  toggleTab('generalRules');
}
