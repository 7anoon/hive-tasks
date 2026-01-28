-- إضافة عمود avatar_url في جدول profiles لحفظ الصورة الشخصية
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
