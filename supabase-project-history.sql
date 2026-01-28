-- إنشاء جدول تاريخ المشروع (Timeline)
CREATE TABLE IF NOT EXISTS project_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'status_changed', 'admin_note_added', 'task_added', 'task_completed'
  event_description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Users can view history for their projects" ON project_history
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_history.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- السماح بالإضافة
CREATE POLICY "Allow insert for authenticated users" ON project_history
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- إضافة index للأداء
CREATE INDEX IF NOT EXISTS idx_project_history_project_id ON project_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_history_created_at ON project_history(created_at DESC);

-- Function لإضافة حدث في التاريخ عند إنشاء مشروع
CREATE OR REPLACE FUNCTION add_project_created_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_history (project_id, event_type, event_description, created_by)
  VALUES (NEW.id, 'created', 'تم إنشاء المشروع', NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لإضافة حدث الإنشاء
DROP TRIGGER IF EXISTS project_created_trigger ON projects;
CREATE TRIGGER project_created_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_created_event();

-- Function لإضافة حدث عند تغيير الحالة
CREATE OR REPLACE FUNCTION add_status_change_event()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_history (project_id, event_type, event_description, old_value, new_value)
    VALUES (NEW.id, 'status_changed', 'تم تغيير حالة المشروع', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتغيير الحالة
DROP TRIGGER IF EXISTS project_status_changed_trigger ON projects;
CREATE TRIGGER project_status_changed_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_status_change_event();

-- Function لإضافة حدث عند إضافة ملاحظات المدير
CREATE OR REPLACE FUNCTION add_admin_note_event()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.admin_notes IS DISTINCT FROM NEW.admin_notes AND NEW.admin_notes IS NOT NULL THEN
    INSERT INTO project_history (project_id, event_type, event_description, created_by)
    VALUES (NEW.id, 'admin_note_added', 'أضاف المدير ملاحظات جديدة', NEW.admin_notes_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لملاحظات المدير
DROP TRIGGER IF EXISTS project_admin_note_trigger ON projects;
CREATE TRIGGER project_admin_note_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_admin_note_event();
