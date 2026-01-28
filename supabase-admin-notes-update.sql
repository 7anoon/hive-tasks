-- إضافة حقول جديدة لملاحظات المدير
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS admin_notes_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS admin_notes_at TIMESTAMP WITH TIME ZONE;

-- تحديث المشاريع الموجودة اللي فيها ملاحظات
UPDATE projects 
SET admin_notes_at = updated_at
WHERE admin_notes IS NOT NULL AND admin_notes_at IS NULL;
