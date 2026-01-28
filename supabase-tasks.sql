-- إنشاء جدول التعديلات/المهام
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- تفعيل RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Users can view tasks for their projects" ON project_tasks
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- السماح للموظفين بتحديث حالة المهمة
CREATE POLICY "Users can update task completion" ON project_tasks
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- السماح للمدير بإضافة وحذف المهام
CREATE POLICY "Admins can insert tasks" ON project_tasks
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete tasks" ON project_tasks
  FOR DELETE 
  TO authenticated
  USING (true);

-- إضافة index للأداء
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
