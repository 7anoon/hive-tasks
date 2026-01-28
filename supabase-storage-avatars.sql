-- إنشاء Storage Bucket للصور الشخصية
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- سياسات الأمان للـ Storage
-- السماح للجميع بقراءة الصور
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- السماح للمستخدمين برفع صورهم الخاصة
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- السماح للمستخدمين بتحديث صورهم الخاصة
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- السماح للمستخدمين بحذف صورهم الخاصة
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- إضافة عمود avatar_url في جدول profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
