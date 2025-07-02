'use client'

import { useState } from 'react'
import Whiteboard from '@/components/Whiteboard'

export default function Page() {
  const [room, setRoom] = useState('')
  const [joinedRoom, setJoinedRoom] = useState('')

  const handleJoinRoom = () => {
    if (room.trim()) {
      setJoinedRoom(room.trim())
    }
  }

  if (joinedRoom) {
    return <Whiteboard room={joinedRoom} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">HackMate Whiteboard</h1>
        <div className="flex flex-col gap-4 items-center">
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-black"
            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
          />
          <button
            onClick={handleJoinRoom}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}