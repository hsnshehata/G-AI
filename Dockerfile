# استخدام صورة Node.js رسمية كـ base image
FROM node:18

# تثبيت الـ dependencies المطلوبة لـ chromium
RUN apt-get update && apt-get install -y \
  chromium \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libxss1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libxkbcommon0 \
  && rm -rf /var/lib/apt/lists/*

# التأكد من المسار بتاع chromium
RUN which chromium || echo "Error: chromium not found"

# طباعة الـ permissions بتاعة chromium
RUN ls -la /usr/bin/chromium || echo "Error: /usr/bin/chromium not found"

# إنشاء user جديد لتشغيل التطبيق
RUN useradd -m -s /bin/bash appuser

# إصلاح الـ permissions عشان appuser يقدر يشغّل chromium
RUN chmod +x /usr/bin/chromium && chown appuser:appuser /usr/bin/chromium

# تحديد متغير بيئي لـ puppeteer عشان يلاقي Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=3000

# التحول لـ appuser
USER appuser

# التأكد من الـ PATH بتاع appuser
RUN echo $PATH > /tmp/path.txt

# تحديد مجلد العمل
WORKDIR /app

# نسخ package.json وتثبيت الـ dependencies
COPY package.json package-lock.json* ./
RUN npm install

# نسخ باقي الملفات (بما فيها مجلد server)
COPY . .

# التأكد إن ملف server/server.js موجود
RUN ls -la server && ls -la server/server.js || echo "Error: server/server.js not found"

# فتح الـ port اللي هيستخدمه التطبيق
EXPOSE $PORT

# تشغيل التطبيق
CMD ["node", "server/server.js"]
