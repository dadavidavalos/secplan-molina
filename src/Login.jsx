import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const FOTOS = [
  '/molina_1.jpg',
  '/molina_2.jpg',
  '/molina_3.jpg',
  '/molina_4.jpg',
  '/molina_5.jpg',
  '/molina_6.jpg',
]

export default function Login({ mostrarReset = false, onResetDone = () => {} }) {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState('')
  const [cargando,     setCargando]     = useState(false)
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [fotoActual,   setFotoActual]   = useState(0)

  // Vista: 'login' | 'olvide' | 'reset'
  const [vista, setVista] = useState('login')
  const [mensajeOk, setMensajeOk] = useState('')

  // Para cambio de contraseña (cuando llega del email)
  const [nuevaPassword,    setNuevaPassword]    = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  // Detectar si viene del link de reset en el email
  useEffect(() => {
    // Por prop desde App.jsx (más confiable)
    if (mostrarReset) {
      setMostrarLogin(true)
      setVista('reset')
    }
    // Método 1: listener de evento Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMostrarLogin(true)
        setVista('reset')
      }
    })
    // Método 2: fallback por hash en URL
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setMostrarLogin(true)
      setVista('reset')
    }
    return () => subscription.unsubscribe()
  }, [mostrarReset])

  // Slideshow automático cada 5 segundos
  useEffect(() => {
    const t = setInterval(() => {
      setFotoActual(f => (f + 1) % FOTOS.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  async function handleLogin() {
    if (!email || !password) return
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
    setCargando(false)
  }

  async function handleOlvidePassword() {
    if (!email) {
      setError('Ingresa tu correo primero')
      return
    }
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    })
    if (error) {
      setError('Error al enviar el correo. Verifica que el email sea correcto.')
    } else {
      setMensajeOk('✓ Te enviamos un correo con el link para restablecer tu contraseña. Revisa tu bandeja de entrada.')
    }
    setCargando(false)
  }

  async function handleResetPassword() {
    if (!nuevaPassword || !confirmarPassword) {
      setError('Completa ambos campos')
      return
    }
    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword })
    if (error) {
      setError('Error al cambiar la contraseña. El link puede haber expirado.')
    } else {
      setMensajeOk('✓ Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
      setVista('login')
      setNuevaPassword('')
      setConfirmarPassword('')
      onResetDone()
      // Limpiar hash de la URL
      window.history.replaceState(null, '', window.location.pathname)
    }
    setCargando(false)
  }

  function volverAlLogin() {
    setVista('login')
    setError('')
    setMensajeOk('')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">

      {/* ── FONDO SLIDESHOW ── */}
      {FOTOS.map((src, i) => (
        <div key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === fotoActual ? 1 : 0,
            zIndex: 0,
          }} />
      ))}

      {/* Overlay oscuro */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(135deg, rgba(15,37,84,0.75) 0%, rgba(27,63,139,0.65) 100%)' }} />

      {/* ── CONTENIDO BIENVENIDA ── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 w-full max-w-2xl">

        <div className="mb-6">
          <img src="/imagen_transparente_molina2.png" alt="SECPLAN Molina"
            style={{ height: 100, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}
            onError={e => e.target.style.display = 'none'} />
        </div>

        <div className="relative mb-2">
          <h1 className="text-white font-black tracking-widest uppercase"
            style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
              letterSpacing: '0.15em',
              lineHeight: 1,
            }}>
            SECPLAN
          </h1>
          <div className="mx-auto mt-3 rounded-full"
            style={{ height: 4, width: 80, background: '#8DC63F' }} />
        </div>

        <p className="text-blue-100 font-medium mt-3 mb-2"
          style={{ fontSize: 18, textShadow: '0 2px 8px rgba(0,0,0,0.5)', letterSpacing: '0.05em' }}>
          Municipalidad de Molina · Región del Maule
        </p>
        <p className="text-blue-200 mb-10"
          style={{ fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          Cartera de Proyectos
        </p>

        {!mostrarLogin && (
          <button
            onClick={() => setMostrarLogin(true)}
            className="font-bold text-white px-10 py-4 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #8DC63F 0%, #6aaa2a 100%)',
              boxShadow: '0 8px 32px rgba(141,198,63,0.4)',
              letterSpacing: '0.05em',
            }}>
            Iniciar sesión →
          </button>
        )}

        <div className="flex gap-2 mt-8">
          {FOTOS.map((_, i) => (
            <button key={i} onClick={() => setFotoActual(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === fotoActual ? 24 : 8,
                height: 8,
                background: i === fotoActual ? '#8DC63F' : 'rgba(255,255,255,0.4)',
              }} />
          ))}
        </div>
      </div>

      {/* ── MODAL ── */}
      {mostrarLogin && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,20,50,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget && vista !== 'reset') setMostrarLogin(false) }}>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'slideUp 0.3s ease' }}>

            {/* Header modal */}
            <div className="px-8 pt-8 pb-5 text-center"
              style={{ background: 'linear-gradient(135deg, #0F2554 0%, #1B3F8B 100%)' }}>
              <img src="/imagen_transparente_molina2.png" alt="SECPLAN"
                style={{ height: 56, objectFit: 'contain', margin: '0 auto 12px' }}
                onError={e => e.target.style.display = 'none'} />
              <h2 className="text-white font-black text-lg tracking-wide">
                {vista === 'login'  && 'Iniciar sesión'}
                {vista === 'olvide' && 'Restablecer contraseña'}
                {vista === 'reset'  && 'Nueva contraseña'}
              </h2>
              <p className="text-blue-200 text-xs mt-1">SECPLAN Molina</p>
            </div>

            {/* ── VISTA: LOGIN ── */}
            {vista === 'login' && (
              <div className="px-8 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" placeholder="tu@email.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ background: '#F9FAFB' }}
                    onFocus={e => e.target.style.borderColor = '#1B3F8B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ background: '#F9FAFB' }}
                    onFocus={e => e.target.style.borderColor = '#1B3F8B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>

                {/* Link olvidé contraseña */}
                <div className="text-right">
                  <button onClick={() => { setVista('olvide'); setError(''); setMensajeOk('') }}
                    className="text-xs text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {mensajeOk && (
                  <p className="text-green-600 text-xs bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                    {mensajeOk}
                  </p>
                )}
                {error && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button onClick={handleLogin} disabled={cargando}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0F2554 0%, #1B3F8B 100%)' }}>
                  {cargando ? 'Cargando...' : 'Entrar'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Acceso solo para personal autorizado de SECPLAN Molina
                </p>
              </div>
            )}

            {/* ── VISTA: OLVIDÉ CONTRASEÑA ── */}
            {vista === 'olvide' && (
              <div className="px-8 py-6 space-y-4">
                <p className="text-sm text-gray-500 text-center">
                  Ingresa tu correo y te enviaremos un link para restablecer tu contraseña.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" placeholder="tu@email.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleOlvidePassword()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ background: '#F9FAFB' }}
                    onFocus={e => e.target.style.borderColor = '#1B3F8B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>

                {mensajeOk && (
                  <p className="text-green-600 text-xs bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                    {mensajeOk}
                  </p>
                )}
                {error && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button onClick={handleOlvidePassword} disabled={cargando || !!mensajeOk}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0F2554 0%, #1B3F8B 100%)' }}>
                  {cargando ? 'Enviando...' : 'Enviar correo de restablecimiento'}
                </button>

                <button onClick={volverAlLogin}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Volver al inicio de sesión
                </button>
              </div>
            )}

            {/* ── VISTA: RESET (viene del email) ── */}
            {vista === 'reset' && (
              <div className="px-8 py-6 space-y-4">
                <p className="text-sm text-gray-500 text-center">
                  Ingresa tu nueva contraseña.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={nuevaPassword}
                    onChange={e => setNuevaPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ background: '#F9FAFB' }}
                    onFocus={e => e.target.style.borderColor = '#1B3F8B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
                  <input type="password" placeholder="Repite la contraseña" value={confirmarPassword}
                    onChange={e => setConfirmarPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ background: '#F9FAFB' }}
                    onFocus={e => e.target.style.borderColor = '#1B3F8B'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>

                {mensajeOk && (
                  <p className="text-green-600 text-xs bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                    {mensajeOk}
                  </p>
                )}
                {error && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button onClick={handleResetPassword} disabled={cargando}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0F2554 0%, #1B3F8B 100%)' }}>
                  {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}