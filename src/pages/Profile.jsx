import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, User, Briefcase, FolderOpen, CheckCircle2, Clock, AlertCircle, Edit3, Camera, Upload } from 'lucide-react'
import './Profile.css'

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
    fetchProjects()
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
    setEditedProfile(data)
  }

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
    setProjects(data || [])
  }

  const calculateStatus = () => {
    // حساب الحالة بناءً على المشاريع
    const inProgressProjects = projects.filter(p => p.status === 'in_progress')
    
    // التحقق من المشاريع المتأخرة (تجاوزت تاريخ التسليم)
    const today = new Date()
    const delayedProjects = inProgressProjects.filter(p => {
      if (p.due_date) {
        return new Date(p.due_date) < today
      }
      // لو مفيش due_date، نحسب بناءً على 7 أيام من تاريخ الإنشاء
      const daysSinceCreation = Math.floor((today - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
      return daysSinceCreation > 7
    })

    if (delayedProjects.length > 0) {
      return 'delayed' // متأخر - في مشاريع فاتت ميعاد التسليم
    } else if (inProgressProjects.length >= 3) {
      return 'busy' // ضغط شغل - 3 مشاريع أو أكثر قيد العمل
    } else {
      return 'active' // نشط - كل شيء تمام
    }
  }

  const currentStatus = calculateStatus()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار صورة فقط')
        return
      }

      // التحقق من حجم الملف (أقل من 1MB)
      if (file.size > 1 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 1 ميجابايت')
        return
      }

      setUploading(true)

      // تحويل الصورة إلى Base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64String = reader.result

          // تحديث البروفايل بالصورة الجديدة
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: base64String })
            .eq('id', user.id)

          if (updateError) throw updateError

          // تحديث الحالة المحلية
          setProfile({ ...profile, avatar_url: base64String })
          setEditedProfile({ ...editedProfile, avatar_url: base64String })
          alert('تم تحديث الصورة بنجاح! ✨')
        } catch (error) {
          console.error('Error updating avatar:', error)
          alert('حدث خطأ أثناء تحديث الصورة: ' + error.message)
        } finally {
          setUploading(false)
        }
      }

      reader.onerror = () => {
        alert('حدث خطأ أثناء قراءة الصورة')
        setUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error handling file:', error)
      alert('حدث خطأ: ' + error.message)
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editedProfile.full_name,
        job_title: editedProfile.job_title
      })
      .eq('id', user.id)

    if (!error) {
      setProfile(editedProfile)
      setIsEditing(false)
      // إعادة تحميل البيانات
      fetchProfile()
    } else {
      alert('حدث خطأ أثناء الحفظ: ' + error.message)
    }
  }

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    )
  }

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    with_notes: projects.filter(p => p.admin_notes).length
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      active: { text: 'نشط', color: '#10b981', icon: '🟢', class: 'status-active' },
      busy: { text: 'ضغط شغل', color: '#f59e0b', icon: '🟡', class: 'status-busy' },
      delayed: { text: 'متأخر', color: '#ef4444', icon: '🔴', class: 'status-delayed' }
    }
    return statusMap[status] || statusMap.active
  }

  const statusInfo = getStatusInfo(profile.status || 'active')

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowRight size={20} />
          العودة للوحة التحكم
        </button>

        <div className="profile-grid">
          {/* القسم الرئيسي */}
          <div className="profile-main">
            <div className="profile-header-card card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="avatar-image" />
                  ) : (
                    <User size={48} />
                  )}
                  <button 
                    className="avatar-edit-btn" 
                    title="تغيير الصورة"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    {uploading ? <Upload size={16} className="spin" /> : <Camera size={16} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="profile-header-info">
                  {isEditing ? (
                    <input
                      type="text"
                      className="name-input"
                      value={editedProfile.full_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    />
                  ) : (
                    <h1>{profile.full_name || profile.email}</h1>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      className="job-input"
                      placeholder="الوظيفة / الدور"
                      value={editedProfile.job_title || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, job_title: e.target.value })}
                    />
                  ) : (
                    <p className="job-title">
                      <Briefcase size={16} />
                      {profile.job_title || 'موظف'}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-status-section">
                <label>الحالة:</label>
                <span className={`status-badge-profile ${getStatusInfo(currentStatus).class}`}>
                  {getStatusInfo(currentStatus).icon} {getStatusInfo(currentStatus).text}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--gray-600)', marginRight: 'auto' }}>
                  {currentStatus === 'delayed' && '⚠️ لديك مشاريع متأخرة'}
                  {currentStatus === 'busy' && '📊 لديك ضغط عمل'}
                  {currentStatus === 'active' && '✨ كل شيء على ما يرام'}
                </span>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button className="btn btn-success" onClick={handleSaveProfile}>
                      حفظ التغييرات
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                      setIsEditing(false)
                      setEditedProfile(profile)
                    }}>
                      إلغاء
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    <Edit3 size={18} />
                    تعديل البروفايل
                  </button>
                )}
              </div>
            </div>

            <div className="stats-cards">
              <div className="stat-card-profile card">
                <div className="stat-icon-profile" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FolderOpen size={24} />
                </div>
                <div className="stat-content-profile">
                  <h3>{stats.total}</h3>
                  <p>إجمالي المشاريع</p>
                </div>
              </div>

              <div className="stat-card-profile card">
                <div className="stat-icon-profile" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div className="stat-content-profile">
                  <h3>{stats.completed}</h3>
                  <p>مشاريع مكتملة</p>
                </div>
              </div>

              <div className="stat-card-profile card">
                <div className="stat-icon-profile" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Clock size={24} />
                </div>
                <div className="stat-content-profile">
                  <h3>{stats.in_progress}</h3>
                  <p>قيد العمل</p>
                </div>
              </div>

              <div className="stat-card-profile card">
                <div className="stat-icon-profile" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                  <AlertCircle size={24} />
                </div>
                <div className="stat-content-profile">
                  <h3>{stats.with_notes}</h3>
                  <p>ملاحظات جديدة</p>
                </div>
              </div>
            </div>

            <div className="profile-actions-card card">
              <h3>الإجراءات السريعة</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => navigate('/dashboard')}>
                  <FolderOpen size={20} />
                  عرض كل المشاريع
                </button>
                <button className="action-btn" onClick={() => navigate('/dashboard')}>
                  <CheckCircle2 size={20} />
                  المشاريع المكتملة
                </button>
              </div>
            </div>
          </div>

          {/* القسم الجانبي */}
          <div className="profile-sidebar">
            <div className="info-card card">
              <h3>معلومات الحساب</h3>
              <div className="info-list">
                <div className="info-item-profile">
                  <span className="info-label-profile">البريد الإلكتروني</span>
                  <span className="info-value-profile">{profile.email}</span>
                </div>
                <div className="info-item-profile">
                  <span className="info-label-profile">اسم المستخدم</span>
                  <span className="info-value-profile">{profile.username}</span>
                </div>
                <div className="info-item-profile">
                  <span className="info-label-profile">رقم التليفون</span>
                  <span className="info-value-profile">{profile.phone || 'غير محدد'}</span>
                </div>
                <div className="info-item-profile">
                  <span className="info-label-profile">الدور</span>
                  <span className="info-value-profile">
                    {profile.role === 'admin' ? 'مدير' : 'موظف'}
                  </span>
                </div>
              </div>
            </div>

            <div className="performance-card card">
              <h3>الأداء</h3>
              <div className="performance-item">
                <span>نسبة الإنجاز</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{ 
                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="performance-text">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
