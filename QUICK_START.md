# 🚀 دليل البدء السريع

## خطوات التشغيل السريعة

### 1️⃣ تثبيت المشروع
```bash
npm install
```

### 2️⃣ إعداد قاعدة البيانات

#### أ) إنشاء مشروع Supabase
1. اذهب إلى https://supabase.com
2. سجل دخول أو أنشئ حساب
3. اضغط "New Project"
4. املأ البيانات وانتظر إنشاء المشروع

#### ب) نسخ بيانات الاتصال
1. من لوحة Supabase، اذهب إلى Settings → API
2. انسخ:
   - `Project URL`
   - `anon public key`

#### ج) إعداد ملف .env
```bash
# انسخ الملف
cp .env.example .env

# افتح .env وضع البيانات
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3️⃣ إنشاء الجداول

نفذ الملفات SQL بالترتيب في Supabase SQL Editor:

#### الخطوة 1: الجداول الأساسية
```sql
-- نفذ محتوى ملف: supabase-update.sql
```

#### الخطوة 2: الصور الشخصية
```sql
-- نفذ محتوى ملف: supabase-add-avatar.sql
```

#### الخطوة 3: الميزات المتقدمة
```sql
-- نفذ محتوى ملف: supabase-add-priority.sql
```

### 4️⃣ تشغيل المشروع
```bash
npm run dev
```

سيفتح المشروع على: http://localhost:5174

---

## 🎯 إنشاء أول حساب

### حساب المدير (Admin)
1. افتح المشروع
2. سجل حساب جديد
3. اذهب إلى Supabase → Table Editor → profiles
4. ابحث عن حسابك وغيّر `role` من `employee` إلى `admin`
5. سجل خروج ودخول مرة أخرى

### حساب موظف
1. سجل حساب جديد
2. سيكون `role` = `employee` تلقائياً

---

## ✅ اختبار الميزات

### للموظف:
- [ ] إضافة مشروع جديد
- [ ] تحديد أولوية المشروع
- [ ] البحث في المشاريع
- [ ] تفعيل Dark Mode
- [ ] رفع صورة شخصية
- [ ] عرض الإشعارات

### للمدير:
- [ ] عرض جميع المشاريع
- [ ] عرض قائمة الموظفين
- [ ] إضافة ملاحظة على مشروع
- [ ] تغيير حالة مشروع
- [ ] عرض صور الموظفين

---

## 🐛 حل المشاكل الشائعة

### المشروع لا يعمل
```bash
# امسح node_modules وأعد التثبيت
rm -rf node_modules
npm install
npm run dev
```

### خطأ في الاتصال بـ Supabase
- تأكد من صحة بيانات `.env`
- تأكد من تنفيذ جميع ملفات SQL
- تحقق من اتصال الإنترنت

### الصور لا تُرفع
- تأكد من تنفيذ `supabase-add-avatar.sql`
- تحقق من حجم الصورة (أقل من 1MB)
- تأكد من نوع الملف (صورة فقط)

### Dark Mode لا يعمل
- امسح cache المتصفح
- تأكد من استيراد `dark-mode.css` في App.jsx

---

## 📚 موارد إضافية

- [README.md](README.md) - الوثائق الكاملة
- [FEATURES.md](FEATURES.md) - شرح الميزات
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

---

## 🆘 الدعم

إذا واجهت أي مشكلة:
1. راجع هذا الدليل
2. تحقق من ملفات SQL
3. راجع console المتصفح للأخطاء
4. تأكد من بيانات Supabase

---

**جاهز للانطلاق! 🚀**
