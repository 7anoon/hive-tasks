# 🚀 خطوات النشر السريعة

## ✅ الإعدادات جاهزة!

تم تحديث المشروع وهو جاهز للنشر على GitHub Pages.

---

## 📝 الخطوات (بالترتيب):

### 1️⃣ تثبيت Git
إذا لم يكن مثبتاً:
- حملي من: https://git-scm.com/download/win
- ثبتي بالإعدادات الافتراضية
- أعيدي تشغيل VS Code

### 2️⃣ إعداد Git (أول مرة فقط)
افتحي Terminal في VS Code (`Ctrl + ~`) ونفذي:
```bash
git config --global user.email "7anoon.987@gmail.com"
git config --global user.name "Hanoon"
```

### 3️⃣ إنشاء Repository على GitHub
1. اذهبي إلى: https://github.com/new
2. سجلي دخول بـ:
   - Email: `7anoon.987@gmail.com`
   - Password: `Hanoon171717`
3. Repository name: `hive-tasks`
4. اختاري `Public`
5. **لا تضيفي** README
6. اضغطي `Create repository`

### 4️⃣ رفع المشروع (في Terminal)
```bash
git init
git add .
git commit -m "Initial commit - v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hive-tasks.git
git push -u origin main
```

**عند طلب Password:** استخدمي الـ Personal Access Token من GitHub

### 5️⃣ النشر على GitHub Pages
```bash
npm run deploy
```

أو استخدمي الملف الجاهز:
```bash
deploy.bat
```

### 6️⃣ تفعيل GitHub Pages
1. اذهبي إلى: https://github.com/YOUR_USERNAME/hive-tasks/settings/pages
2. في `Source`، اختاري `gh-pages`
3. اضغطي `Save`

### 7️⃣ افتحي الموقع! 🎉
```
https://YOUR_USERNAME.github.io/hive-tasks/
```

---

## 🔄 للتحديث لاحقاً:

```bash
git add .
git commit -m "وصف التحديث"
git push
npm run deploy
```

---

## 📚 للمزيد من التفاصيل:
اقرأي ملف `DEPLOY_GUIDE.md`

---

**جاهز للنشر! 🚀**
