-- إضافة حقل تاريخ التسليم للمشاريع
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- تحديث المشاريع الموجودة بتاريخ تسليم افتراضي (7 أيام من تاريخ الإنشاء)
UPDATE projects 
SET due_date = (created_at + INTERVAL '7 days')::DATE
WHERE due_date IS NULL;
