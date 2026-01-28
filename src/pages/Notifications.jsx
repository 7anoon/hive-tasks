import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Bell, CheckCircle2, AlertCircle, MessageSquare, Calendar, X } from 'lucide-react'
import './Notifications.css'

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      // جلب المشاريع التي عليها ملاحظات من المدير
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .not('admin_notes', 'is', null)
        .order('updated_at', { ascending: false })

      // تحويل المشاريع إلى إشعارات
      const notifs = projects?.map(project => ({
        id: project.id,
        type: 'admin_note',
        title: 'ملاحظة جديدة من المدير',
        message: project.admin_notes,
        projectTitle: project.title,
        projectId: project.id,
        date: project.updated_at,
        read: false
      })) || []

      // إضافة إشعارات المشاريع المتأخرة
      const { data: delayedProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')

      const today = new Date()
      const delayedNotifs = delayedProjects?.filter(p => {
        if (p.due_date) {
          return new Date(p.due_date) < today
        }
        const daysSinceCreation = Math.floor((today - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
        return daysSinceCreation > 7
      }).map(project => ({
        id: `delayed-${project.id}`,
        type: 'delayed',
        title: 'مشروع متأخر',
        message: `المشروع "${project.title}" متأخر عن الموعد المحدد`,
        projectTitle: project.title,
        projectId: project.id,
        date: project.created_at,
        read: false
      })) || []

      setNotifications([...notifs, ...delayedNotifs])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notifId) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ))
  }

  const deleteNotification = (notifId) => {
    setNotifications(notifications.filter(n => n.id !== notifId))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin_note':
        return <MessageSquare size={24} />
      case 'delayed':
        return <AlertCircle size={24} />
      default:
        return <Bell size={24} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'admin_note':
        return '#667eea'
      case 'delayed':
        return '#ef4444'
      default:
        return '#10b981'
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowRight size={20} />
            العودة
          </button>
          <div className="header-title">
            <Bell size={28} />
            <h1>الإشعارات</h1>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="unread-count">{notifications.filter(n => !n.read).length}</span>
            )}
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-icon">
                <Bell size={64} />
              </div>
              <h3>لا توجد إشعارات</h3>
              <p>ستظهر هنا الإشعارات والملاحظات الجديدة</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-card ${notif.read ? 'read' : 'unread'}`}
                onClick={() => {
                  markAsRead(notif.id)
                  navigate(`/project/${notif.projectId}`)
                }}
              >
                <div 
                  className="notification-icon" 
                  style={{ background: getNotificationColor(notif.type) }}
                >
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header-row">
                    <h3>{notif.title}</h3>
                    <button
                      className="delete-notif-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="notification-project">📁 {notif.projectTitle}</p>
                  <p className="notification-message">{notif.message}</p>
                  <div className="notification-footer">
                    <span className="notification-date">
                      <Calendar size={14} />
                      {new Date(notif.date).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {!notif.read && <span className="unread-dot"></span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
