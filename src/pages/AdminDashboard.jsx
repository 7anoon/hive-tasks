import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Edit, X, Plus, Trash2, CheckSquare, FolderOpen, CheckCircle2, AlertCircle, Users, Settings, User } from 'lucide-react'
import './AdminDashboard.css'

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('projects') // 'projects' or 'employees'
  const [allProjects, setAllProjects] = useState([])
  const [users, setUsers] = useState([])
  const [editingTasks, setEditingTasks] = useState(null)
  const [newTask, setNewTask] = useState('')
  const [projectTasks, setProjectTasks] = useState({})
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null) // لفلترة المشاريع حسب الموظف
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
    fetchAllProjects()
    fetchUsers()
    fetchAllTasks()
  }, [])

  const fetchAllTasks = async () => {
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      const tasksByProject = {}
      data.forEach(task => {
        if (!tasksByProject[task.project_id]) {
          tasksByProject[task.project_id] = []
        }
        tasksByProject[task.project_id].push(task)
      })
      setProjectTasks(tasksByProject)
    }
  }

  const handleAddTask = async (projectId) => {
    if (!newTask.trim()) return

    const { error } = await supabase
      .from('project_tasks')
      .insert([{
        project_id: projectId,
        task_text: newTask,
        created_by: user.id
      }])

    if (!error) {
      setNewTask('')
      fetchAllTasks()
    }
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (!error) {
      fetchAllTasks()
    }
  }

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

  const fetchAllProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
    setAllProjects(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
    setUsers(data || [])
  }

  const handleStatusChange = async (projectId, newStatus) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId)

    if (!error) {
      fetchAllProjects()
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: 'مكتمل', class: 'badge-success' },
      in_progress: { text: 'شغال عليه', class: 'badge-warning' },
      transferred: { text: 'اتحوّل', class: 'badge-info' }
    }
    return statusMap[status] || statusMap.in_progress
  }

  const isProjectDelayed = (project) => {
    if (project.status !== 'in_progress') return false
    const today = new Date()
    if (project.due_date) {
      return new Date(project.due_date) < today
    }
    const daysSinceCreation = Math.floor((today - new Date(project.created_at)) / (1000 * 60 * 60 * 24))
    return daysSinceCreation > 7
  }

  const delayedProjects = allProjects.filter(isProjectDelayed)
  const activeEmployees = users.filter(u => {
    const userProjects = allProjects.filter(p => p.user_id === u.id && p.status === 'in_progress')
    return userProjects.length > 0
  })

  // فلترة المشاريع حسب الموظف المختار
  const filteredProjects = selectedEmployeeId 
    ? allProjects.filter(p => p.user_id === selectedEmployeeId)
    : allProjects

  const handleViewEmployeeProjects = (employeeId) => {
    setSelectedEmployeeId(employeeId)
    setActiveTab('projects')
    // Scroll to projects section
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const clearEmployeeFilter = () => {
    setSelectedEmployeeId(null)
  }

  return (
    <div className="admin-dashboard-container">
      <nav className="navbar-admin">
        <div className="navbar-admin-content">
          <div className="navbar-admin-brand">
            <Settings size={24} color="#6366f1" />
            <h1>لوحة تحكم المدير</h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowRight size={18} />
            العودة
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Tabs Navigation */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderOpen size={20} />
            إدارة المشاريع
          </button>
          <button 
            className={`admin-tab ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={20} />
            إدارة الموظفين
          </button>
        </div>
        {/* Projects Tab Content */}
        {activeTab === 'projects' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي المشاريع</span>
                  <div className="stat-icon-admin total">
                    <FolderOpen size={20} />
                  </div>
                </div>
                <p className="stat-number">{allProjects.length}</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">المكتملة</span>
                  <div className="stat-icon-admin completed">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <p className="stat-number">
                  {allProjects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">قيد العمل</span>
                  <div className="stat-icon-admin active">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <p className="stat-number">
                  {allProjects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">المتأخرة</span>
                  <div className="stat-icon-admin delayed">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <p className="stat-number">{delayedProjects.length}</p>
              </div>
            </div>

            <div className="admin-projects-section">
              <div className="section-header">
                <h2 className="section-title">📁 إدارة المشاريع</h2>
                {selectedEmployeeId && (
                  <button 
                    className="btn btn-secondary btn-clear-filter"
                    onClick={clearEmployeeFilter}
                  >
                    <X size={18} />
                    عرض كل المشاريع
                  </button>
                )}
              </div>
              {selectedEmployeeId && (
                <div className="employee-filter-badge">
                  <User size={16} />
                  <span>
                    عرض مشاريع: {users.find(u => u.id === selectedEmployeeId)?.full_name || 'موظف'}
                  </span>
                </div>
              )}
              <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>الموظف</th>
                  <th>الحالة</th>
                  <th>آخر تعديل</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const statusInfo = getStatusBadge(project.status)
                  const isDelayed = isProjectDelayed(project)
                  
                  return (
                    <tr key={project.id} className={isDelayed ? 'delayed-row' : ''}>
                      <td className="project-name-cell">
                        <div className="project-name-wrapper">
                          <strong>{project.title}</strong>
                          {isDelayed && (
                            <span className="delayed-badge">
                              <AlertCircle size={14} />
                              متأخر
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="employee-cell">
                        <div className="employee-info">
                          <div className="employee-avatar-small">
                            {project.profiles?.avatar_url ? (
                              <img src={project.profiles.avatar_url} alt={project.profiles.full_name} className="avatar-img" />
                            ) : (
                              <Users size={14} />
                            )}
                          </div>
                          <span>{project.profiles?.full_name || project.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="status-cell">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className={`status-select-table ${statusInfo.class}`}
                        >
                          <option value="in_progress">شغال عليه</option>
                          <option value="completed">مكتمل</option>
                          <option value="transferred">اتحوّل</option>
                        </select>
                      </td>
                      <td className="date-cell">
                        {project.updated_at 
                          ? new Date(project.updated_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : new Date(project.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                        }
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => navigate(`/project/${project.id}`)}
                            title="فتح المشروع"
                          >
                            <FolderOpen size={18} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => navigate(`/admin/edit/${project.id}`)}
                            title="تعديل المشروع"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-tasks"
                            onClick={() => setEditingTasks(editingTasks === project.id ? null : project.id)}
                            title="إدارة التعديلات"
                          >
                            <CheckSquare size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="empty-table">
              <FolderOpen size={64} />
              <p>{selectedEmployeeId ? 'لا توجد مشاريع لهذا الموظف' : 'لا توجد مشاريع بعد'}</p>
            </div>
          )}
            </div>
          </>
        )}

        {/* Employees Tab Content */}
        {activeTab === 'employees' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي الموظفين</span>
                  <div className="stat-icon-admin total">
                    <Users size={20} />
                  </div>
                </div>
                <p className="stat-number">{users.filter(u => u.role !== 'admin').length}</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">النشطين</span>
                  <div className="stat-icon-admin completed">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <p className="stat-number">{activeEmployees.length}</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">ضغط شغل</span>
                  <div className="stat-icon-admin active">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <p className="stat-number">
                  {users.filter(u => {
                    if (u.role === 'admin') return false
                    const employeeProjects = allProjects.filter(p => p.user_id === u.id)
                    const inProgressCount = employeeProjects.filter(p => p.status === 'in_progress').length
                    const delayedProjects = employeeProjects.filter(isProjectDelayed)
                    return delayedProjects.length === 0 && inProgressCount >= 3
                  }).length}
                </p>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">متأخرين</span>
                  <div className="stat-icon-admin delayed">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <p className="stat-number">
                  {users.filter(u => {
                    if (u.role === 'admin') return false
                    const employeeProjects = allProjects.filter(p => p.user_id === u.id)
                    const delayedProjects = employeeProjects.filter(isProjectDelayed)
                    return delayedProjects.length > 0
                  }).length}
                </p>
              </div>
            </div>

            <div className="admin-employees-section">
          <div className="section-header">
            <h2 className="section-title">👥 إدارة الموظفين</h2>
          </div>
          <div className="employees-table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الوظيفة</th>
                  <th>عدد المشاريع</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'admin').map((employee) => {
                  const employeeProjects = allProjects.filter(p => p.user_id === employee.id)
                  const inProgressCount = employeeProjects.filter(p => p.status === 'in_progress').length
                  const completedCount = employeeProjects.filter(p => p.status === 'completed').length
                  
                  // حساب حالة الموظف
                  const delayedProjects = employeeProjects.filter(isProjectDelayed)
                  let employeeStatus = 'active'
                  if (delayedProjects.length > 0) {
                    employeeStatus = 'delayed'
                  } else if (inProgressCount >= 3) {
                    employeeStatus = 'busy'
                  }

                  const statusInfo = {
                    active: { text: 'نشط', class: 'status-active', icon: '🟢' },
                    busy: { text: 'ضغط شغل', class: 'status-busy', icon: '🟡' },
                    delayed: { text: 'متأخر', class: 'status-delayed', icon: '🔴' }
                  }

                  return (
                    <tr key={employee.id}>
                      <td className="employee-name-cell">
                        <div className="employee-avatar">
                          {employee.avatar_url ? (
                            <img src={employee.avatar_url} alt={employee.full_name} className="avatar-img" />
                          ) : (
                            <Users size={20} />
                          )}
                        </div>
                        <div className="employee-details">
                          <strong>{employee.full_name || employee.username}</strong>
                          <span className="employee-email">{employee.email}</span>
                        </div>
                      </td>
                      <td className="job-title-cell">
                        {employee.job_title || 'موظف'}
                      </td>
                      <td className="projects-count-cell">
                        <div className="projects-breakdown">
                          <span className="total-projects">{employeeProjects.length}</span>
                          <div className="projects-details">
                            <span className="in-progress">{inProgressCount} قيد العمل</span>
                            <span className="completed">{completedCount} مكتمل</span>
                          </div>
                        </div>
                      </td>
                      <td className="employee-status-cell">
                        <span className={`employee-status-badge ${statusInfo[employeeStatus].class}`}>
                          {statusInfo[employeeStatus].icon} {statusInfo[employeeStatus].text}
                        </span>
                      </td>
                      <td className="employee-actions-cell">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewEmployeeProjects(employee.id)}
                        >
                          عرض المشاريع
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {users.filter(u => u.role !== 'admin').length === 0 && (
            <div className="empty-table">
              <Users size={64} />
              <p>لا يوجد موظفين بعد</p>
            </div>
          )}
            </div>
          </>
        )}

        {/* Modal إدارة التعديلات */}
        {editingTasks && (
          <div className="modal-overlay" onClick={() => setEditingTasks(null)}>
            <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
              <h2>إدارة التعديلات المطلوبة</h2>
              
              <div className="add-task-form-modal">
                <input
                  type="text"
                  placeholder="أضف تعديل جديد..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask(editingTasks)}
                />
                <button
                  className="btn btn-success"
                  onClick={() => handleAddTask(editingTasks)}
                >
                  <Plus size={18} />
                  إضافة
                </button>
              </div>

              <div className="tasks-list-modal">
                {projectTasks[editingTasks]?.map((task) => (
                  <div key={task.id} className="task-item-modal">
                    <span className={task.is_completed ? 'completed' : ''}>
                      {task.task_text}
                    </span>
                    <div className="task-actions">
                      {task.is_completed && (
                        <span className="task-status-badge">✓ مكتمل</span>
                      )}
                      <button
                        className="btn-icon-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!projectTasks[editingTasks] || projectTasks[editingTasks].length === 0) && (
                  <p className="no-tasks-modal">لا توجد تعديلات بعد</p>
                )}
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setEditingTasks(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
