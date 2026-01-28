# 🚀 دليل النشر على GitHub Pages

## المعلومات المطلوبة:
- **GitHub Token**: احصلي عليه من GitHub Settings → Developer settings → Personal access tokens
- **Email**: بريدك الإلكتروني على GitHub
- **Repository**: `hive-tasks`
- **Repository**: `hive-tasks`

---

## ⚠️ ملاحظة مهمة جداً:
**لا تشاركي الـ Token مع أحد!** هذا الـ Token يعطي صلاحيات كاملة على حسابك.

---

## 📋 خطوات النشر:

### 1️⃣ تثبيت Git (إذا لم يكن مثبتاً)
1. حملي Git من: https://git-scm.com/download/win
2. ثبتيه بالإعدادات الافتراضية
3. أعيدي تشغيل الكمبيوتر

### 2️⃣ فتح Terminal في مجلد المشروع
1. افتحي مجلد المشروع في VS Code
2. اضغطي `Ctrl + ~` لفتح Terminal
3. أو من القائمة: Terminal → New Terminal

### 3️⃣ إعداد Git (أول مرة فقط)
```bash
git config --global user.email "7anoon.987@gmail.com"
git config --global user.name "Hanoon"
```

### 4️⃣ إنشاء Repository على GitHub
1. اذهبي إلى: https://github.com
2. سجلي دخول بالبيانات:
   - Email: `7anoon.987@gmail.com`
   - Password: `Hanoon171717`
3. اضغطي على `+` في الأعلى → `New repository`
4. املأي البيانات:
   - Repository name: `hive-tasks`
   - Description: `نظام إدارة المشاريع`
   - Public ✅
   - **لا تضيفي** README أو .gitignore
5. اضغطي `Create repository`

### 5️⃣ ربط المشروع بـ GitHub
في Terminal، نفذي الأوامر دي بالترتيب:

```bash
# 1. تهيئة Git
git init

# 2. إضافة جميع الملفات
git add .

# 3. عمل Commit
git commit -m "Initial commit - Project Management System v2.0"

# 4. تغيير اسم الـ branch
git branch -M main

# 5. ربط بـ GitHub (استبدلي YOUR_USERNAME باسم المستخدم)
git remote add origin https://github.com/YOUR_USERNAME/hive-tasks.git

# 6. رفع الملفات
git push -u origin main
```

**ملاحظة:** عند طلب Username وPassword:
- Username: اسم المستخدم على GitHub
- Password: استخدمي الـ Personal Access Token بدل الباسورد

### 6️⃣ النشر على GitHub Pages
```bash
npm run deploy
```

### 7️⃣ تفعيل GitHub Pages
1. اذهبي إلى: https://github.com/YOUR_USERNAME/hive-tasks
2. اضغطي على `Settings`
3. من القائمة الجانبية، اختاري `Pages`
4. في `Source`، اختاري `gh-pages` branch
5. اضغطي `Save`

### 8️⃣ الوصول للموقع
بعد دقيقة أو اثنتين، الموقع هيكون متاح على:
```
https://YOUR_USERNAME.github.io/hive-tasks/
```

---

## 🔄 تحديث الموقع (بعد أي تعديل)

```bash
# 1. إضافة التعديلات
git add .

# 2. عمل Commit
git commit -m "وصف التعديل"

# 3. رفع على GitHub
git push

# 4. نشر التحديث
npm run deploy
```

---

## 🐛 حل المشاكل

### المشكلة: git command not found
**الحل:** ثبتي Git من الرابط في الخطوة 1

### المشكلة: Permission denied
**الحل:** استخدمي الـ Token بدل الباسورد

### المشكلة: npm run deploy فشل
**الحل:** 
```bash
# امسحي مجلد dist وأعيدي البناء
rm -rf dist
npm run build
npm run deploy
```

### المشكلة: الموقع يظهر 404
**الحل:**
1. تأكدي من تفعيل GitHub Pages من Settings
2. تأكدي من اختيار `gh-pages` branch
3. انتظري 2-3 دقائق

### المشكلة: الموقع يعمل لكن الصفحات الداخلية تعطي 404
**الحل:** أضيفي ملف `.nojekyll` في مجلد `public`:
```bash
# في Terminal
echo "" > public/.nojekyll
git add .
git commit -m "Add .nojekyll"
git push
npm run deploy
```

---

## 📱 طريقة بديلة: استخدام GitHub Desktop

إذا كان Git من Terminal صعب:

1. حملي GitHub Desktop: https://desktop.github.com
2. سجلي دخول بحسابك
3. اضغطي `File` → `Add Local Repository`
4. اختاري مجلد المشروع
5. اضغطي `Publish repository`
6. بعدها استخدمي Terminal لـ:
```bash
npm run deploy
```

---

## ✅ التحقق من النجاح

بعد النشر، تحققي من:
- [ ] الموقع يفتح على الرابط
- [ ] تسجيل الدخول يعمل
- [ ] الصفحات تفتح بدون 404
- [ ] الصور تظهر
- [ ] Dark Mode يعمل

---

## 🔐 أمان الـ Token

**مهم جداً:**
1. لا تشاركي الـ Token مع أحد
2. لا ترفعيه على GitHub
3. إذا تسرب، احذفيه فوراً من:
   - GitHub → Settings → Developer settings → Personal access tokens

---

## 📞 الدعم

إذا واجهتي أي مشكلة:
1. اقرأي رسالة الخطأ بعناية
2. جربي الحلول المذكورة أعلاه
3. تأكدي من اتصال الإنترنت
4. تأكدي من صحة البيانات

---

**بالتوفيق! 🚀**
