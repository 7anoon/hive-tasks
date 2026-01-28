import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Save, Trash2, Edit3, X, Calendar, Clock, CheckCircle2, AlertCircle, User, FileText, CheckSquare, Square } from 'lucide-react'
import './ProjectDetails.css'

export default function ProjectDetails({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [history, setHistory] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState({})
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchProject()
    fetchUserProfile()
    fetchTasks()
    fetchHistory()
  }, [id])

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setUserProfile(data)
  }

  const fetchProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (full_name, email, username),
        admin_profile:admin_notes_by (full_name, email)
      `)
      .eq('id', id)
      .single()
    setProject(data)
    setEditedProject(data)
  }

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
    setTasks(data || [])
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('project_history')
      .select(`
        *,
        profiles:created_by (full_name, email)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false })
    setHistory(data || [])
  }

  const handleToggleTask = async (taskId, currentStatus) => {
    const { error } = await supabase
      .from('project_tasks')
      .update({ 
        is_completed: !currentStatus,
        completed_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', taskId)

    if (!error) {
      fetchTasks()
    }
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('projects')
      .update({
        title: editedProject.title,
        description: editedProject.description,
        status: editedProject.status
      })
      .eq('id', id)

    if (!error) {
      setProject(editedProject)
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (!error) {
        navigate('/dashboard')
      }
    }
  }

  if (!project) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    )
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      completed: { text: 'مكتمل', class: 'status-completed', icon: CheckCircle2, color: '#10b981' },
      in_progress: { text: 'شغال عليه', class: 'status-in-progress', icon: Clock, color: '#f59e0b' },
      transferred: { text: 'اتحوّل لحد تاني', class: 'status-transferred', icon: ArrowRight, color: '#3b82f6' },
      delayed: { text: 'متأخر', class: 'status-delayed', icon: AlertCircle, color: '#ef4444' }
    }
    return statusMap[status] || statusMap.in_progress
  }

  // حساب إذا كان المشروع متأخر
  const isDelayed = () => {
    if (project.status !== 'in_progress') return false
    const today = new Date()
    if (project.due_date) {
      return new Date(project.due_date) < today
    }
    const daysSinceCreation = Math.floor((today - new Date(project.created_at)) / (1000 * 60 * 60 * 24))
    return daysSinceCreation > 7
  }

  const projectIsDelayed = isDelayed()
  const displayStatus = projectIsDelayed ? 'delayed' : project.status
  const statusInfo = getStatusInfo(displayStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div className="project-details-page">
      <div className="project-details-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowRight size={20} />
          العودة للوحة التحكم
        </button>

        <div className="project-details-grid">
          {/* القسم الرئيسي */}
          <div className="main-section">
            <div className="project-header-card card">
              <div className="project-header-top">
                {isEditing ? (
                  <input
                    type="text"
                    className="title-input"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                  />
                ) : (
                  <h1 className="project-title">{project.title}</h1>
                )}
                
                <div className="action-buttons">
                  {isEditing ? (
                    <>
                      <button className="btn btn-success" onClick={handleSave}>
                        <Save size={18} />
                        حفظ
                      </button>
                      <button className="btn btn-secondary" onClick={() => {
                        setIsEditing(false)
                        setEditedProject(project)
                      }}>
                        <X size={18} />
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <Edit3 size={18} />
                        تعديل
                      </button>
                      <button className="btn btn-danger" onClick={handleDelete}>
                        <Trash2 size={18} />
                        حذف
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="status-display">
                <StatusIcon size={24} style={{ color: statusInfo.color }} />
                {isEditing ? (
                  <select
                    className="status-select"
                    value={editedProject.status}
                    onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value })}
                  >
                    <option value="in_progress">شغال عليه</option>
                    <option value="completed">مكتمل</option>
                    <option value="transferred">اتحوّل لحد تاني</option>
                  </select>
                ) : (
                  <span className={`status-badge-large ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                )}
                {projectIsDelayed && !isEditing && (
                  <span className="delayed-warning">
                    <AlertCircle size={18} />
                    تحذير: المشروع متأخر!
                  </span>
                )}
              </div>
            </div>

            <div className="description-card card">
              <div className="card-header">
                <FileText size={20} />
                <h3>وصف المشروع</h3>
              </div>
              {isEditing ? (
                <textarea
                  className="description-textarea"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  rows="6"
                />
              ) : (
                <p className="description-text">{project.description}</p>
              )}
            </div>

            {project.admin_notes && (
              <div className="admin-notes-card-large card">
                <div className="admin-notes-header-large">
                  <AlertCircle size={24} />
                  <h3>تعليمات / تعديلات المدير</h3>
                </div>
                <div className="admin-notes-content">
                  <div className="admin-notes-meta">
                    <div className="admin-signature">
                      <User size={16} />
                      <span>بواسطة: {project.admin_profile?.full_name || 'المدير'}</span>
                    </div>
                    <div className="admin-timestamp">
                      <Clock size={16} />
                      <span>
                        {project.admin_notes_at 
                          ? new Date(project.admin_notes_at).toLocaleString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'غير محدد'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="admin-notes-text">
                    {project.admin_notes}
                  </div>
                  <div className="admin-notes-footer">
                    <AlertCircle size={14} />
                    <span>للقراءة فقط - لا يمكن التعديل</span>
                  </div>
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="tasks-card card">
                <div className="card-header">
                  <CheckSquare size={20} />
                  <h3>التعديلات المطلوبة</h3>
                  <span className="tasks-count">
                    {tasks.filter(t => t.is_completed).length} / {tasks.length}
                  </span>
                </div>
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`task-item ${task.is_completed ? 'completed' : ''}`}
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                    >
                      <div className="task-checkbox">
                        {task.is_completed ? (
                          <CheckSquare size={22} className="checkbox-checked" />
                        ) : (
                          <Square size={22} className="checkbox-unchecked" />
                        )}
                      </div>
                      <div className="task-content">
                        <p className="task-text">{task.task_text}</p>
                        {task.completed_at && (
                          <span className="task-completed-date">
                            تم الإنجاز: {new Date(task.completed_at).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tasks-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(tasks.filter(t => t.is_completed).length / tasks.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100)}% مكتمل
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* القسم الجانبي */}
          <div className="sidebar-section">
            <div className="info-card card">
              <h3 className="info-card-title">معلومات المشروع</h3>
              
              <div className="info-item">
                <div className="info-icon">
                  <User size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">الموظف المسؤول</span>
                  <span className="info-value">
                    {project.profiles?.full_name || project.profiles?.username || project.profiles?.email || 'غير محدد'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Calendar size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">تاريخ الإنشاء</span>
                  <span className="info-value">
                    {new Date(project.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Clock size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">آخر تحديث</span>
                  <span className="info-value">
                    {project.updated_at 
                      ? new Date(project.updated_at).toLocaleDateString('ar-EG')
                      : new Date(project.created_at).toLocaleDateString('ar-EG')
                    }
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon" style={{ background: statusInfo.color }}>
                  <StatusIcon size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">الحالة</span>
                  <span className="info-value">{statusInfo.text}</span>
                </div>
              </div>

              {tasks.length > 0 && (
                <div className="info-item">
                  <div className="info-icon" style={{ background: '#10b981' }}>
                    <CheckSquare size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">التعديلات</span>
                    <span className="info-value">
                      {tasks.filter(t => t.is_completed).length} من {tasks.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {project.admin_notes && (
              <div className="alert-card card">
                <AlertCircle size={20} color="#f59e0b" />
                <p>لديك ملاحظات جديدة من المدير</p>
              </div>
            )}

            {tasks.length > 0 && tasks.some(t => !t.is_completed) && (
              <div className="alert-card card" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderColor: '#3b82f6' }}>
                <AlertCircle size={20} color="#2563eb" />
                <p>لديك {tasks.filter(t => !t.is_completed).length} تعديل غير مكتمل</p>
              </div>
            )}

            {history.length > 0 && (
              <div className="timeline-card card">
                <h3 className="timeline-title">
                  <Clock size={20} />
                  سجل المشروع
                </h3>
                <div className="timeline">
                  {history.map((event, index) => (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      {index < history.length - 1 && <div className="timeline-line"></div>}
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`timeline-badge ${event.event_type}`}>
                            {event.event_type === 'created' && '🎉'}
                            {event.event_type === 'status_changed' && '🔄'}
                            {event.event_type === 'admin_note_added' && '📝'}
                            {event.event_type === 'task_added' && '✅'}
                          </span>
                          <span className="timeline-description">{event.event_description}</span>
                        </div>
                        {event.profiles && (
                          <span className="timeline-user">
                            بواسطة: {event.profiles.full_name || event.profiles.email}
                          </span>
                        )}
                        <span className="timeline-date">
                          {new Date(event.created_at).toLocaleString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
