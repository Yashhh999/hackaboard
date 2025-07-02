'use client'

import { useParams } from 'next/navigation'
import Whiteboard from '@/components/Whiteboard'

export default function WhiteboardPage() {
  const params = useParams()
  const roomName = decodeURIComponent(params['room-name'] as string)

  if (!roomName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Room Name</h1>
          <p className="text-gray-600 mt-2">Please check your URL</p>
        </div>
      </div>
    )
  }

  return <Whiteboard room={roomName} />
}