import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, Mail, Lock, User, Phone } from 'lucide-react'
import './Login.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // البحث عن المستخدم باليوزر نيم
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('username', username)
      .single()

    console.log('Profile search result:', { profile, profileError })

    if (profileError || !profile) {
      setError(`اسم المستخدم غير موجود. الخطأ: ${profileError?.message || 'لم يتم العثور على المستخدم'}`)
      setLoading(false)
      return
    }

    // تسجيل الدخول بالإيميل
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    console.log('Login result:', { error })

    if (error) {
      setError(`خطأ في تسجيل الدخول: ${error.message}`)
    }
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // التحقق من أن اليوزر نيم غير مستخدم
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      setError('اسم المستخدم مستخدم بالفعل')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          phone: phone,
        },
        emailRedirectTo: undefined
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن')
      setEmail('')
      setPassword('')
      setFullName('')
      setUsername('')
      setPhone('')
      setTimeout(() => setIsSignUp(false), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>نظام إدارة المشاريع</h1>
          <p>{isSignUp ? 'أنشئ حساب جديد' : 'مرحباً بك، قم بتسجيل الدخول للمتابعة'}</p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="login-form">
          {isSignUp && (
            <>
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Phone size={20} className="input-icon" />
                <input
                  type="tel"
                  placeholder="رقم التليفون"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <User size={20} className="input-icon" />
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...') : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
            >
              {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
