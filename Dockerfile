# استخدام صورة Node.js رسمية كـ base image (هنستخدم node:18 بدل node:18-slim عشان تكون أكتر استقرارًا)
FROM node:18

# تثبيت الـ dependencies المطلوبة لـ chromium
RUN apt-get update && apt-get install -y \
  chromium \
  && rm -rf /var/lib/apt/lists/*

# التأكد من المسار بتاع chromium
RUN which chromium || echo "Error: chromium not found"

# تحديد متغير بيئي لـ puppeteer عشان يلاقي Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=3000

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
