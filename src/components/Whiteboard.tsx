'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface DrawData {
  id?: string
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  room: string
  timestamp?: string
}

interface WhiteboardProps {
  room: string
}

export default function Whiteboard({ room }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.emit('join-room', room)

    newSocket.on('draw', (data: DrawData) => {
      drawLine(data.prevX, data.prevY, data.x, data.y, data.color, data.lineWidth)
    })

    newSocket.on('load-drawings', (drawings: DrawData[]) => {
      clearCanvas()
      drawings.forEach(drawing => {
        drawLine(drawing.prevX, drawing.prevY, drawing.x, drawing.y, drawing.color, drawing.lineWidth)
      })
    })

    newSocket.on('clear-canvas', () => {
      clearCanvas()
    })

    return () => {
      newSocket.disconnect()
    }
  }, [room])

  const drawLine = (prevX: number, prevY: number, x: number, y: number, strokeColor: string, strokeWidth: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setLastPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !socket) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    const drawData: DrawData = {
      prevX: lastPos.x,
      prevY: lastPos.y,
      x: currentPos.x,
      y: currentPos.y,
      color,
      lineWidth,
      room
    }

    drawLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y, color, lineWidth)
    socket.emit('draw', drawData)
    setLastPos(currentPos)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleClearCanvas = () => {
    if (socket) {
      socket.emit('clear-canvas', room)
      clearCanvas()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <label htmlFor="color">Color:</label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border rounded"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <label htmlFor="lineWidth">Size:</label>
          <input
            id="lineWidth"
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-20"
          />
          <span>{lineWidth}px</span>
        </div>

        <button
          onClick={handleClearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-300 bg-white cursor-crosshair"
      />
      
      <p className="text-sm text-gray-600">Room: {room}</p>
    </div>
  )
}