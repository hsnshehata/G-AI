# استخدام صورة Node.js رسمية كـ base image
FROM node:18-slim

# تثبيت الـ dependencies اللي محتاجينها (بما فيها chromium-browser)
RUN apt-get update && apt-get install -y \
  chromium \
  && rm -rf /var/lib/apt/lists/*

# تحديد متغير بيئي لـ puppeteer عشان يلاقي Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# تحديد مجلد العمل
WORKDIR /app

# نسخ package.json وتثبيت الـ dependencies
COPY package.json package-lock.json* ./
RUN npm install

# نسخ باقي الملفات
COPY . .

# تشغيل التطبيق
CMD ["node", "server/server.js"]
