import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket')
      const newSocket = io()
      setSocket(newSocket)
    }

    socketInitializer()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return socket
}

export default useSocket