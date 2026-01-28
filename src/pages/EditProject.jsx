import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Save, AlertCircle, User, FileText, MessageSquare, CheckSquare, Plus, Trash2 } from 'lucide-react'
import './EditProject.css'

export default function EditProject({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'in_progress',
    user_id: '',
    admin_notes: '',
    due_date: ''
  })

  useEffect(() => {
    checkAdminAccess()
    fetchProject()
    fetchEmployees()
    fetchTasks()
  }, [id])

  const checkAdminAccess = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') {
      navigate('/dashboard')
    }
  }

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (id, full_name, email, username)
      `)
      .eq('id', id)
      .single()

    if (data) {
      setProject(data)
      setFormData({
        title: data.title,
        description: data.description || '',
        status: data.status,
        user_id: data.user_id,
        admin_notes: data.admin_notes || '',
        due_date: data.due_date || ''
      })
    }
    setLoading(false)
  }

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
    setEmployees(data || [])
  }

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
    setTasks(data || [])
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return

    const { error } = await supabase
      .from('project_tasks')
      .insert([{
        project_id: id,
        task_text: newTask,
        created_by: user.id
      }])

    if (!error) {
      setNewTask('')
      fetchTasks()
      
      // Add to history
      await supabase.from('project_history').insert([{
        project_id: id,
        event_type: 'task_added',
        event_description: `تم إضافة مهمة جديدة: ${newTask}`,
        created_by: user.id
      }])
    }
  }

  const handleDeleteTask = async (taskId, taskText) => {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (!error) {
      fetchTasks()
      
      // Add to history
      await supabase.from('project_history').insert([{
        project_id: id,
        event_type: 'task_deleted',
        event_description: `تم حذف مهمة: ${taskText}`,
        created_by: user.id
      }])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const confirmSave = async () => {
    const updates = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      user_id: formData.user_id,
      admin_notes: formData.admin_notes,
      admin_notes_by: user.id,
      admin_notes_at: new Date().toISOString(),
      due_date: formData.due_date || null,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)

    if (!error) {
      // Add to history
      const changes = []
      if (project.status !== formData.status) {
        changes.push(`الحالة من "${getStatusText(project.status)}" إلى "${getStatusText(formData.status)}"`)
      }
      if (project.user_id !== formData.user_id) {
        const oldEmployee = employees.find(e => e.id === project.user_id)
        const newEmployee = employees.find(e => e.id === formData.user_id)
        changes.push(`الموظف من "${oldEmployee?.full_name}" إلى "${newEmployee?.full_name}"`)
      }
      if (project.admin_notes !== formData.admin_notes) {
        changes.push('تم تحديث ملاحظات المدير')
      }

      if (changes.length > 0) {
        await supabase.from('project_history').insert([{
          project_id: id,
          event_type: 'project_updated',
          event_description: `تم تعديل المشروع: ${changes.join(', ')}`,
          created_by: user.id
        }])
      }

      navigate('/admin')
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      in_progress: 'شغال عليه',
      completed: 'مكتمل',
      transferred: 'اتحوّل لحد تاني'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="edit-project-container">
      <nav className="navbar-edit">
        <div className="navbar-edit-content">
          <div className="navbar-edit-brand">
            <FileText size={24} color="#6366f1" />
            <h1>تعديل المشروع</h1>
          </div>
          <button className="back-btn-edit" onClick={() => navigate('/admin')}>
            <ArrowRight size={18} />
            العودة للوحة المدير
          </button>
        </div>
      </nav>

      <div className="edit-container">
        <div className="edit-card">
          <div className="edit-header">
            <div className="edit-header-icon">
              <FileText size={32} />
            </div>
            <div className="edit-header-text">
              <h2>تعديل بيانات المشروع</h2>
              <p>قم بتعديل معلومات المشروع وحفظ التغييرات</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Project Title */}
            <div className="form-group">
              <label>
                <FileText size={18} />
                اسم المشروع
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="أدخل اسم المشروع"
              />
            </div>

            {/* Project Description */}
            <div className="form-group">
              <label>
                <MessageSquare size={18} />
                وصف المشروع
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="أدخل وصف المشروع"
              />
            </div>

            {/* Employee Selection */}
            <div className="form-group">
              <label>
                <User size={18} />
                الموظف المسؤول
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
              >
                <option value="">اختر موظف</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.username} - {emp.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="form-group">
              <label>
                <CheckSquare size={18} />
                حالة المشروع
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                className={`status-select-edit status-${formData.status}`}
              >
                <option value="in_progress">شغال عليه</option>
                <option value="completed">مكتمل</option>
                <option value="transferred">اتحوّل لحد تاني</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label>
                <AlertCircle size={18} />
                تاريخ التسليم المتوقع
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            {/* Admin Notes */}
            <div className="form-group">
              <label>
                <MessageSquare size={18} />
                ملاحظات وتعليمات المدير
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                rows="6"
                placeholder="أضف ملاحظاتك وتعليماتك للموظف هنا..."
                className="admin-notes-input"
              />
              <p className="field-hint">
                <AlertCircle size={14} />
                هذه الملاحظات سيراها الموظف المسؤول عن المشروع
              </p>
            </div>

            {/* Tasks Management */}
            <div className="form-group tasks-section">
              <label>
                <CheckSquare size={18} />
                المهام والتعديلات المطلوبة
              </label>
              
              <div className="add-task-form-edit">
                <input
                  type="text"
                  placeholder="أضف مهمة جديدة..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                />
                <button
                  type="button"
                  className="btn btn-success btn-add-task"
                  onClick={handleAddTask}
                >
                  <Plus size={18} />
                  إضافة
                </button>
              </div>

              <div className="tasks-list-edit">
                {tasks.map((task) => (
                  <div key={task.id} className="task-item-edit">
                    <div className="task-content">
                      <CheckSquare size={16} />
                      <span className={task.is_completed ? 'completed' : ''}>
                        {task.task_text}
                      </span>
                      {task.is_completed && (
                        <span className="task-completed-badge">✓ مكتملة</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-delete-task"
                      onClick={() => handleDeleteTask(task.id, task.task_text)}
                      title="حذف المهمة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="no-tasks-edit">لا توجد مهام بعد. أضف مهمة جديدة أعلاه.</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-save">
                <Save size={20} />
                حفظ التعديلات
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertCircle size={48} />
            </div>
            <h2>تأكيد حفظ التعديلات</h2>
            <p>هل أنت متأكد من حفظ جميع التعديلات على هذا المشروع؟</p>
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={confirmSave}>
                <Save size={18} />
                نعم، احفظ التعديلات
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
