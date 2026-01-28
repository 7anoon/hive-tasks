import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogOut, Plus, FolderOpen, Settings, Bell, Search, Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight, User, Star, Moon, Sun } from 'lucide-react'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { useTheme } from '../context/ThemeContext'
import './Dashboard.css'

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '', priority: 'medium' })
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const { toasts, removeToast, success, error } = useToast()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserProfile()
    fetchProjects()
  }, [user])

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setUserProfile(data)
  }

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    const { error: insertError } = await supabase
      .from('projects')
      .insert([
        {
          title: newProject.title,
          description: newProject.description,
          user_id: user.id,
          status: 'in_progress',
          priority: newProject.priority
        }
      ])

    if (!insertError) {
      setNewProject({ title: '', description: '', priority: 'medium' })
      setShowAddProject(false)
      fetchProjects()
      success('تم إضافة المشروع بنجاح! 🎉')
    } else {
      error('حدث خطأ أثناء إضافة المشروع')
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: 'مكتمل', class: 'badge-success', icon: CheckCircle2 },
      in_progress: { text: 'شغال عليه', class: 'badge-warning', icon: Clock },
      transferred: { text: 'اتحوّل لحد تاني', class: 'badge-info', icon: ArrowRight }
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

  const filteredProjects = projects.filter(p => {
    // فلترة حسب الحالة
    if (filter === 'all') {
      // لا شيء
    } else if (filter === 'delayed') {
      if (p.status !== 'in_progress') return false
      const today = new Date()
      if (p.due_date) {
        if (new Date(p.due_date) >= today) return false
      } else {
        const daysSinceCreation = Math.floor((today - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
        if (daysSinceCreation <= 7) return false
      }
    } else {
      if (p.status !== filter) return false
    }

    // فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const titleMatch = p.title.toLowerCase().includes(query)
      const descMatch = p.description?.toLowerCase().includes(query)
      if (!titleMatch && !descMatch) return false
    }

    return true
  })

  // ترتيب المشاريع
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
    } else if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'ar')
    }
    return 0
  })

  const delayedCount = projects.filter(p => {
    if (p.status !== 'in_progress') return false
    const today = new Date()
    if (p.due_date) {
      return new Date(p.due_date) < today
    }
    const daysSinceCreation = Math.floor((today - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
    return daysSinceCreation > 7
  }).length

  const stats = {
    total: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    with_notes: projects.filter(p => p.admin_notes).length,
    delayed: delayedCount,
    high_priority: projects.filter(p => p.priority === 'high').length
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="brand-icon">
              <FolderOpen size={24} />
            </div>
            <div className="brand-text">
              <h2>نظام إدارة المشاريع</h2>
              <p>مرحباً، {userProfile?.full_name || user.email}</p>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="icon-btn" title="الإشعارات" onClick={() => navigate('/notifications')}>
              <Bell size={20} />
              {stats.with_notes > 0 && <span className="notification-badge">{stats.with_notes}</span>}
            </button>
            <button className="icon-btn" onClick={toggleTheme} title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={() => navigate('/profile')} title="الملف الشخصي">
              <User size={20} />
            </button>
            {userProfile?.role === 'admin' && (
              <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                <Settings size={18} />
                لوحة المدير
              </button>
            )}
            <button className="btn btn-danger" onClick={handleLogout}>
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="stats-section">
          <div className="stat-box">
            <div className="stat-icon total">
              <FolderOpen size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>إجمالي المشاريع</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon progress">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.in_progress}</h3>
              <p>قيد العمل</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon completed">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.completed}</h3>
              <p>مكتملة</p>
            </div>
          </div>
          <div className="stat-box" style={{ cursor: 'pointer' }} onClick={() => setFilter('delayed')}>
            <div className="stat-icon notes" style={{ background: stats.delayed > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.delayed}</h3>
              <p>متأخرة</p>
            </div>
          </div>
        </div>

        <div className="dashboard-header">
          <div className="header-left">
            <h1>مشاريعي</h1>
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                الكل ({projects.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setFilter('in_progress')}
              >
                قيد العمل ({stats.in_progress})
              </button>
              <button 
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                مكتملة ({stats.completed})
              </button>
              <button 
                className={`filter-tab ${filter === 'delayed' ? 'active' : ''}`}
                onClick={() => setFilter('delayed')}
                style={{ 
                  background: filter === 'delayed' ? '#ef4444' : 'transparent',
                  color: filter === 'delayed' ? 'white' : stats.delayed > 0 ? '#ef4444' : 'var(--gray-600)'
                }}
              >
                متأخرة ({stats.delayed})
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-add" onClick={() => setShowAddProject(true)}>
            <Plus size={20} />
            مشروع جديد
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="search-sort-bar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ابحث في المشاريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-dropdown">
            <label>ترتيب حسب:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">التاريخ</option>
              <option value="priority">الأولوية</option>
              <option value="title">الاسم</option>
            </select>
          </div>
        </div>

        {showAddProject && (
          <div className="modal-overlay" onClick={() => setShowAddProject(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>إضافة مشروع جديد</h2>
              <form onSubmit={handleAddProject}>
                <input
                  type="text"
                  placeholder="اسم المشروع"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="وصف المشروع"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows="4"
                />
                <div className="priority-selector">
                  <label>الأولوية:</label>
                  <div className="priority-options">
                    <button
                      type="button"
                      className={`priority-btn ${newProject.priority === 'high' ? 'active' : ''}`}
                      onClick={() => setNewProject({ ...newProject, priority: 'high' })}
                      style={{ background: newProject.priority === 'high' ? '#fee2e2' : '#f5f7fa', color: '#dc2626' }}
                    >
                      🔴 عالية
                    </button>
                    <button
                      type="button"
                      className={`priority-btn ${newProject.priority === 'medium' ? 'active' : ''}`}
                      onClick={() => setNewProject({ ...newProject, priority: 'medium' })}
                      style={{ background: newProject.priority === 'medium' ? '#fef3c7' : '#f5f7fa', color: '#d97706' }}
                    >
                      🟡 متوسطة
                    </button>
                    <button
                      type="button"
                      className={`priority-btn ${newProject.priority === 'low' ? 'active' : ''}`}
                      onClick={() => setNewProject({ ...newProject, priority: 'low' })}
                      style={{ background: newProject.priority === 'low' ? '#dbeafe' : '#f5f7fa', color: '#2563eb' }}
                    >
                      🔵 منخفضة
                    </button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">إضافة</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddProject(false)}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="projects-grid">
          {sortedProjects.map((project) => {
            const statusInfo = getStatusBadge(project.status)
            const StatusIcon = statusInfo.icon
            const isDelayed = isProjectDelayed(project)
            
            const priorityColors = {
              high: { bg: '#fee2e2', color: '#dc2626', icon: '🔴' },
              medium: { bg: '#fef3c7', color: '#d97706', icon: '🟡' },
              low: { bg: '#dbeafe', color: '#2563eb', icon: '🔵' }
            }
            const priorityInfo = priorityColors[project.priority || 'medium']
            
            return (
              <div
                key={project.id}
                className={`project-card card ${project.admin_notes ? 'has-notes' : ''} ${isDelayed ? 'delayed-card' : ''}`}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="project-card-header">
                  <div className="project-title-section">
                    <div className="title-with-priority">
                      <h3>{project.title}</h3>
                      <span 
                        className="priority-badge"
                        style={{ background: priorityInfo.bg, color: priorityInfo.color }}
                      >
                        {priorityInfo.icon}
                      </span>
                    </div>
                    <span className={`status-badge ${isDelayed ? 'badge-danger' : statusInfo.class}`}>
                      {isDelayed ? <AlertCircle size={14} /> : <StatusIcon size={14} />}
                      {isDelayed ? 'متأخر' : statusInfo.text}
                    </span>
                  </div>
                  <div className="project-date">
                    <Calendar size={14} />
                    <span>{new Date(project.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                
                <p className="project-description">{project.description}</p>
                
                {isDelayed && (
                  <div className="delayed-alert">
                    <AlertCircle size={16} />
                    <span>تحذير: المشروع متأخر عن الموعد المحدد!</span>
                  </div>
                )}
                
                {project.admin_notes && (
                  <div className="admin-notes-card">
                    <div className="admin-notes-header">
                      <AlertCircle size={18} />
                      <strong>ملاحظات المدير</strong>
                    </div>
                    <p className="admin-notes-text">{project.admin_notes}</p>
                  </div>
                )}

                <div className="project-card-footer">
                  <button className="view-details-btn">
                    عرض التفاصيل
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <FolderOpen size={64} />
            </div>
            <h3>لا توجد مشاريع</h3>
            <p>{searchQuery ? 'لا توجد نتائج للبحث' : filter === 'all' ? 'ابدأ بإضافة مشروع جديد' : 'لا توجد مشاريع في هذه الفئة'}</p>
            {filter === 'all' && !searchQuery && (
              <button className="btn btn-primary" onClick={() => setShowAddProject(true)}>
                <Plus size={20} />
                إضافة مشروع
              </button>
            )}
          </div>
        )}

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
