import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit() {
    if (!email || !password) return
    setCargando(true)
    setError('')

    let result
    if (esRegistro) {
      result = await supabase.auth.signUp({ email, password })
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }

    if (result.error) {
      setError(result.error.message)
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center font-bold text-slate-900 text-xl mx-auto mb-4">
            MO
          </div>
          <h1 className="text-white text-2xl font-bold">SECPLAN Molina</h1>
          <p className="text-slate-400 text-sm mt-1">Plataforma de gestión de proyectos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-5">
            {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={cargando}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all disabled:opacity-50">
              {cargando ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button onClick={() => setEsRegistro(!esRegistro)}
              className="text-slate-900 font-semibold hover:underline">
              {esRegistro ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Municipalidad de Molina · Región del Maule
        </p>
      </div>
    </div>
  )
}