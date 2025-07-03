'use client'

import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRooms } from '@/hooks/useRooms'
import { ThemeContext } from '@/components/SideNav'
import { useToast } from '@/components/Toast'
import { Plus, Users, Trash2, Lock, LogIn, X, Palette, Zap, ArrowRight } from 'lucide-react'
import Image from 'next/image'
export default function Page() {
  const [room, setRoom] = useState('')
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(true)
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null)
  const [joinPassword, setJoinPassword] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { rooms, loading, createRoom, authenticateRoom, deleteRoom } = useRooms()
  const { theme } = useContext(ThemeContext)
  const { addToast, ToastContainer } = useToast()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateRoom = async () => {
    if (room.trim() && password.trim()) {
      const createdRoom = await createRoom(room.trim(), password.trim())
      if (createdRoom) {
        addToast(`Room "${room.trim()}" created successfully!`, 'success')
        router.push(`/whiteboard/${encodeURIComponent(room.trim())}`)
      } else {
        addToast('Failed to create room. Please try again.', 'error')
      }
    } else {
      addToast('Please enter both room name and password.', 'error')
    }
  }

  const handleJoinRoom = async (roomName: string) => {
    if (joinPassword.trim()) {
      const authenticated = await authenticateRoom(roomName, joinPassword.trim())
      if (authenticated) {
        addToast(`Joined room "${roomName}" successfully!`, 'success')
        router.push(`/whiteboard/${encodeURIComponent(roomName)}`)
      } else {
        addToast('Incorrect password. Please try again.', 'error')
      }
    } else {
      addToast('Please enter the room password.', 'error')
    }
  }

  const openJoinForm = (roomName: string) => {
    setShowJoinForm(roomName)
    setJoinPassword('')
  }

  const closeJoinForm = (): void => {
    setShowJoinForm(null)
    setJoinPassword('')
  }

  const handleDeleteRoom = async (roomName: string) => {
    if (deletePassword.trim()) {
      const deleted = await deleteRoom(roomName, deletePassword.trim())
      if (deleted) {
        addToast(`Room "${roomName}" deleted successfully.`, 'success')
        closeDeleteForm()
      } else {
        addToast('Failed to delete room. Check your password.', 'error')
      }
    } else {
      addToast('Please enter the room password to confirm deletion.', 'error')
    }
  }

  const openDeleteForm = (roomName: string) => {
    setShowDeleteForm(roomName)
    setDeletePassword('')
  }

  const closeDeleteForm = () => {
    setShowDeleteForm(null)
    setDeletePassword('')
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          } animate-pulse`}>
            <Image src="/hackaboard.jpg" className="w-full h-full object-cover" alt="hackaboard" width={64} height={64} />
          </div>
          <div className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Loading Hackaboard...
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-2xl mx-auto ${
          theme === 'dark' 
            ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20' 
            : 'bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/5'
        } rounded-3xl border p-8 transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl`}>
          
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
            }`}>
              <Image src="/hackaboard.jpg" className="w-20 h-20 rounded-full object-cover" alt="hackaboard" width={128} height={128} />
            </div>
            <h1 className={`text-4xl font-bold mb-3 bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-white via-gray-100 to-gray-200' 
                : 'from-gray-800 via-gray-700 to-gray-900'
            } bg-clip-text text-transparent`}>
              Welcome to Hackaboard
            </h1>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Create or join a collaborative whiteboard room
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'}`}></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Real-time collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Secure rooms</span>
              </div>
            </div>
          </div>

          <div className={`flex mb-8 p-1.5 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-700/80' : 'bg-gray-100/80'
          } backdrop-blur-sm`}>
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                isCreating 
                  ? (theme === 'dark' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105') 
                  : (theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50')
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Create Room</span>
              {isCreating && <Zap className="w-4 h-4 animate-pulse" />}
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                !isCreating 
                  ? (theme === 'dark' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105') 
                  : (theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50')
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Join Room</span>
              {!isCreating && <Zap className="w-4 h-4 animate-pulse" />}
            </button>
          </div>

        {isCreating ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter room name"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:scale-[1.02] ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/80' 
                      : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/80'
                  }`}
                />
                <div className={`absolute right-4 top-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="group relative">
                <input
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:scale-[1.02] ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/80' 
                      : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/80'
                  }`}
                />
                <div className={`absolute right-4 top-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={loading || !room.trim() || !password.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold 
                       hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-indigo-500/30 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                       transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
                       relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating your room...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span>Create Room</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
            <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Your room will be password protected
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.length > 0 ? (
              <>
                <div className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p className="text-lg font-medium">Available Rooms</p>
                  <p className="text-sm opacity-75">Choose a room to join</p>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {rooms.map((room, index) => (
                    <div key={room.id} className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group ${
                      theme === 'dark' 
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/80 hover:border-gray-500' 
                        : 'bg-white/50 border-gray-200 hover:bg-white/80 hover:border-indigo-300'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
                            }`}>
                              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {room.name}
                              </h3>
                              <div className={`text-sm flex items-center gap-2 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <div className="flex items-center gap-1">
                                  <Palette className="w-3 h-3" />
                                  <span>{room._count?.drawings || 0} drawings</span>
                                </div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Protected</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => openJoinForm(room.name)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 
                                     transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg hover:shadow-xl
                                     flex items-center gap-2 group"
                          >
                            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                            Join
                          </button>
                          <button
                            onClick={() => openDeleteForm(room.name)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 
                                     transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg hover:shadow-xl
                                     flex items-center gap-2 group"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={`text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}>
                  <Users className="w-12 h-12 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
                <p className="text-base mb-6">Be the first to create a collaborative space!</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium
                           hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105
                           flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create First Room
                </button>
              </div>
            )}
          </div>
        )}

        {showJoinForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl transition-all duration-300 transform animate-slideUp ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <LogIn className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Join Room
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        "{showJoinForm}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeJoinForm}
                    className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                      theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter room password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom(showJoinForm)}
                      autoFocus
                    />
                    <Lock className={`absolute right-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleJoinRoom(showJoinForm)}
                      disabled={loading || !joinPassword.trim()}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 
                               focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                               transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Joining...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <LogIn className="w-5 h-5" />
                          <span>Join Room</span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={closeJoinForm}
                      className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl transition-all duration-300 transform animate-slideUp ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Delete Room
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        "{showDeleteForm}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDeleteForm}
                    className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                      theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className={`p-4 rounded-2xl border-2 ${
                    theme === 'dark' 
                      ? 'bg-red-900/20 border-red-800/50 text-red-300' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">!</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Permanent deletion</p>
                        <p className="text-xs opacity-75">This action cannot be undone. All drawings will be lost.</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter room password to confirm"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleDeleteRoom(showDeleteForm)}
                      autoFocus
                    />
                    <Lock className={`absolute right-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteRoom(showDeleteForm)}
                      disabled={loading || !deletePassword.trim()}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-rose-600 
                               focus:ring-4 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                               transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Trash2 className="w-5 h-5" />
                          <span>Delete Room</span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={closeDeleteForm}
                      className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}