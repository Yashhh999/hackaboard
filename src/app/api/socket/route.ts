import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

interface DrawData {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  room: string
}

const SocketHandler = (req: NextRequest) => {
  return new Response('Socket.IO server', { status: 200 })
}

export { SocketHandler as GET, SocketHandler as POST }