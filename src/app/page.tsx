'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRooms } from '@/hooks/useRooms'

export default function Page() {
  const [room, setRoom] = useState('')
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(true)
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null)
  const [joinPassword, setJoinPassword] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const { rooms, loading, createRoom, authenticateRoom, deleteRoom } = useRooms()
  const router = useRouter()

  const handleCreateRoom = async () => {
    if (room.trim() && password.trim()) {
      const createdRoom = await createRoom(room.trim(), password.trim())
      if (createdRoom) {
        router.push(`/whiteboard/${encodeURIComponent(room.trim())}`)
      }
    }
  }

  const handleJoinRoom = async (roomName: string) => {
    if (joinPassword.trim()) {
      const authenticated = await authenticateRoom(roomName, joinPassword.trim())
      if (authenticated) {
        router.push(`/whiteboard/${encodeURIComponent(roomName)}`)
      }
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
        closeDeleteForm()
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8">HackMate Whiteboard</h1>
        
        {/* Create/Join Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsCreating(true)}
            className={`flex-1 py-2 px-4 rounded-md ${
              isCreating ? 'bg-white shadow' : 'text-gray-600'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className={`flex-1 py-2 px-4 rounded-md ${
              !isCreating ? 'bg-white shadow' : 'text-gray-600'
            }`}
          >
            Join Room
          </button>
        </div>

        {isCreating ? (
          /* Create New Room */
          <div className="flex flex-col gap-4 items-center">
            <input
              type="text"
              placeholder="Enter room name"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-black w-full"
            />
            <input
              type="password"
              placeholder="Enter room password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-black w-full"
            />
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 w-full"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        ) : (
          /* Join Existing Room */
          <div>
            {rooms.length > 0 ? (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="text-left">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-gray-500">
                        {room._count?.drawings || 0} drawings
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openJoinForm(room.name)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Join
                      </button>
                      <button
                        onClick={() => openDeleteForm(room.name)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No rooms available. Create one first!</p>
            )}
          </div>
        )}

        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Join "{showJoinForm}"</h3>
              <input
                type="password"
                placeholder="Enter room password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black w-full mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom(showJoinForm)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleJoinRoom(showJoinForm)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
                <button
                  onClick={closeJoinForm}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Password Modal */}
        {showDeleteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Delete "{showDeleteForm}"</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the room password to confirm deletion. This action cannot be undone.
              </p>
              <input
                type="password"
                placeholder="Enter room password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black w-full mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleDeleteRoom(showDeleteForm)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteRoom(showDeleteForm)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={closeDeleteForm}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}