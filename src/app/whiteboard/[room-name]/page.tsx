'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useContext } from 'react'
import Whiteboard from '@/components/Whiteboard'
import { ThemeContext } from '@/components/SideNav'

export default function WhiteboardPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useContext(ThemeContext)
  const roomName = decodeURIComponent(params['room-name'] as string)
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!roomName) {
      setIsLoading(false)
      return
    }

    const authKey = `hackmate_auth_${roomName}`
    const isSessionAuthenticated = sessionStorage.getItem(authKey) === 'true'
    
    if (isSessionAuthenticated) {
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [roomName])

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setError('')

    try {
      const response = await fetch('/api/room/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          password: password
        }),
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem(`hackmate_auth_${roomName}`, 'true')
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Failed to authenticate. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!roomName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Room Name</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Please check your URL</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home 
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Authentication</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Enter the password for room: <span className="font-semibold text-blue-600">{roomName}</span>
            </p>
          </div>

          <form onSubmit={handleAuthentication} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAuthenticating ? 'Authenticating...' : 'Join Room'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Whiteboard room={roomName} />
}