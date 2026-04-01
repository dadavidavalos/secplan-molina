import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function AdminPanel({ onCerrar }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [nuevoRol, setNuevoRol] = useState('usuario')
  const [mensaje, setMensaje] = useState('')
  const [creando, setCreando] = useState(false)

  useEffect(() => { cargarUsuarios() }, [])

  async function cargarUsuarios() {
    const { data } = await supabase.from('Usuarios').select('*').order('created_at', { ascending: false })
    setUsuarios(data || [])
    setCargando(false)
  }

  async function crearUsuario() {
    if (!nuevoEmail || !nuevaPassword || !nuevoNombre) {
      setMensaje('Completa todos los campos')
      return
    }
    setCreando(true)
    setMensaje('')

    const { data, error } = await supabase.auth.admin.createUser({
      email: nuevoEmail,
      password: nuevaPassword,
      email_confirm: true,
    })

    if (error) {
      setMensaje('Error: ' + error.message)
      setCreando(false)
      return
    }

    await supabase.from('Usuarios').insert([{
      id: data.user.id,
      email: nuevoEmail,
      nombre: nuevoNombre,
      rol: nuevoRol,
    }])

    setMensaje('✓ Usuario creado exitosamente')
    setNuevoEmail('')
    setNuevoNombre('')
    setNuevaPassword('')
    setNuevoRol('usuario')
    setCreando(false)
    cargarUsuarios()
  }

  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return
    await supabase.from('Usuarios').delete().eq('id', id)
    cargarUsuarios()
  }

  async function cambiarRol(id, rol) {
    await supabase.from('Usuarios').update({ rol }).eq('id', id)
    cargarUsuarios()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Panel de administrador</h2>
            <p className="text-sm text-gray-500">Gestión de usuarios</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Crear usuario */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Crear nuevo usuario</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre</label>
                <input type="text" placeholder="Nombre completo" value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900 bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" placeholder="correo@ejemplo.com" value={nuevoEmail}
                  onChange={e => setNuevoEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900 bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contraseña</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900 bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rol</label>
                <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900 bg-white">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            {mensaje && (
              <p className={`text-xs px-3 py-2 rounded-lg mb-3 ${mensaje.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {mensaje}
              </p>
            )}
            <button onClick={crearUsuario} disabled={creando}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-all">
              {creando ? 'Creando...' : '+ Crear usuario'}
            </button>
          </div>

          {/* Lista de usuarios */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Usuarios registrados ({usuarios.length})
            </h3>
            {cargando ? (
              <p className="text-xs text-gray-400">Cargando...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-xs text-gray-400">No hay usuarios registrados.</p>
            ) : (
              <div className="space-y-2">
                {usuarios.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-slate-900 flex-shrink-0">
                      {(u.nombre || u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.nombre || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-slate-900 bg-white">
                      <option value="usuario">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => eliminarUsuario(u.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-all">
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}