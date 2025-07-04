'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { ThemeContext } from './SideNav'
import { 
  Palette, Eraser, RotateCcw, Download, Minus, Plus, 
  Circle, Pipette, Move, Pen, Maximize2, Minimize2,
  Undo, Redo, Settings, Save, Share2, X, LogOut
} from 'lucide-react'

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
  isEraser?: boolean
}

interface DatabaseDrawing {
  id: string
  roomId: string
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  timestamp: string
  isEraser?: boolean
}

interface WhiteboardProps {
  room: string
}

export default function Whiteboard({ room }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#6366f1')
  const [lineWidth, setLineWidth] = useState(3)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hackaboard-recent-colors')
      return saved ? JSON.parse(saved) : ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#f97316']
    }
    return ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#f97316']
  })
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const { theme } = useContext(ThemeContext)

  const addToRecentColors = (newColor: string) => {
    const updated = [newColor, ...recentColors.filter(c => c !== newColor)].slice(0, 8)
    setRecentColors(updated)
    localStorage.setItem('hackaboard-recent-colors', JSON.stringify(updated))
  }

  const colorCategories = {
    essentials: [
      '#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b',
      '#8b5cf6', '#ec4899', '#64748b', '#f97316', '#14b8a6', '#6366f1'
    ],
    reds: [
      '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c',
      '#991b1b', '#7f1d1d', '#450a0a', '#fef2f2', '#fee2e2', '#fca5a5'
    ],
    oranges: [
      '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#dc2626',
      '#c2410c', '#9a3412', '#7c2d12', '#fff7ed', '#ffedd5', '#fed7aa'
    ],
    yellows: [
      '#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#d97706', '#b45309',
      '#92400e', '#78350f', '#451a03', '#fffbeb', '#fef3c7', '#fde68a'
    ],
    greens: [
      '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
      '#166534', '#14532d', '#052e16', '#f0fdf4', '#dcfce7', '#bbf7d0'
    ],
    blues: [
      '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
      '#1e40af', '#1e3a8a', '#172554', '#eff6ff', '#dbeafe', '#bfdbfe'
    ],
    purples: [
      '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
      '#4c1d95', '#3730a3', '#312e81', '#f5f3ff', '#ede9fe', '#ddd6fe'
    ],
    pinks: [
      '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d',
      '#831843', '#701a75', '#4a044e', '#fdf2f8', '#fce7f3', '#fbcfe8'
    ],
    grays: [
      '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b',
      '#475569', '#334155', '#1e293b', '#0f172a', '#020617', '#f8fafc'
    ],
    special: [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fab1a0',
      '#fd79a8', '#fdcb6e', '#e17055', '#81ecec', '#00b894', '#00cec9',
      '#ffd93d', '#6c5ce7', '#fd79a8', '#fdcb6e', '#00b894', '#0984e3'
    ]
  }

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    const authToken = `hackmate_auth_${room}`
    newSocket.emit('join-room', { roomName: room, authToken })
    console.log('🔗 Joining room:', room, 'with auth token') 

    newSocket.on('draw', (data: DrawData) => {
      drawLine(data.prevX, data.prevY, data.x, data.y, data.color, data.lineWidth, data.isEraser || false)
    })

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error)
    })

    newSocket.on('load-drawings', (drawings: DatabaseDrawing[]) => {
      console.log('Loading drawings:', drawings.length, 'strokes') 
      
      if (!drawings || drawings.length === 0) {
        console.log('No drawings to load, just initializing canvas')
        initializeCanvas()
        return
      }
      
      initializeCanvas()
      
      setTimeout(() => {
        try {
          drawings.forEach((drawing, index) => {
            console.log(`Drawing stroke ${index + 1}:`, {
              from: { x: drawing.prevX, y: drawing.prevY },
              to: { x: drawing.x, y: drawing.y },
              color: drawing.color,
              lineWidth: drawing.lineWidth,
              isEraser: drawing.isEraser
            })
            drawLine(drawing.prevX, drawing.prevY, drawing.x, drawing.y, drawing.color, drawing.lineWidth, drawing.isEraser || false)
          })
          console.log('✅ Successfully loaded and drew', drawings.length, 'strokes')
        } catch (error) {
          console.error('❌ Error loading drawings:', error)
        }
      }, 150) 
    })

    newSocket.on('clear-canvas', () => {
      clearCanvas()
    })

    return () => {
      newSocket.disconnect()
    }
  }, [room, theme])

  useEffect(() => {
    const handleResize = () => {
      setIsFullscreen(prev => prev)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas()
    }
  }, [theme])

  const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      initializeCanvas()
    }
  }

  const drawLine = (prevX: number, prevY: number, x: number, y: number, strokeColor: string, strokeWidth: number, isEraser: boolean = false) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y)
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)' 
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = strokeColor
    }
    
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.stroke()
    
    ctx.globalCompositeOperation = 'source-over'
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect()
    }
    
    sessionStorage.removeItem(`hackmate_auth_${room}`)
    
    router.push('/')
  }

  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    console.log('Canvas initialized with theme:', theme, 'background:', ctx.fillStyle) 
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

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect && e.touches[0]) {
      setLastPos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || !socket) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !e.touches[0]) return

    const currentPos = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    }

    const drawData: DrawData = {
      prevX: lastPos.x,
      prevY: lastPos.y,
      x: currentPos.x,
      y: currentPos.y,
      color: tool === 'eraser' ? '#000000' : color,
      lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth,
      room,
      isEraser: tool === 'eraser'
    }

    drawLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y, drawData.color, drawData.lineWidth, drawData.isEraser)
    socket.emit('draw', drawData)
    setLastPos(currentPos)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
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
      color: tool === 'eraser' ? '#000000' : color, 
      lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth,
      room,
      isEraser: tool === 'eraser'
    }

    drawLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y, drawData.color, drawData.lineWidth, drawData.isEraser)
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

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor)
    addToRecentColors(selectedColor)
    setShowColorPicker(false)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${room}-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getCanvasSize = () => {
    if (typeof window === 'undefined') return { width: 1000, height: 600 }
    
    if (isFullscreen) {
      return {
        width: window.innerWidth - 32,
        height: window.innerHeight - 120
      }
    }
    
    const width = window.innerWidth
    if (width < 640) {
      return { width: width - 32, height: 400 }
    } else if (width < 1024) { 
      return { width: width - 64, height: 500 }
    } else { 
      return { width: 1000, height: 600 }
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      

      <div className={`hidden sm:block sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-b border-gray-700' 
          : 'bg-white/80 border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4">
          

          <div className="flex items-center gap-3">
            

            <div className={`flex items-center gap-1 p-1 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  tool === 'pen'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Pen className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Pen</span>
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  tool === 'eraser'
                    ? 'bg-red-600 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Eraser</span>
              </button>
            </div>


            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50'
                } border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <Palette className="w-4 h-4 text-gray-500" />
                </div>
              </button>


              {showColorPicker && (
                <div className={`absolute top-12 left-0 z-50 w-80 rounded-2xl shadow-2xl border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } p-4 max-h-96 overflow-y-auto`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Color Palette
                    </h3>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className={`p-1 rounded-lg ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>


                  <div className="mb-4">
                    <p className={`text-xs font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Recent Colors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentColors.map((recentColor, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorSelect(recentColor)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            color === recentColor 
                              ? 'border-white shadow-lg ring-2 ring-indigo-500' 
                              : 'border-white/50 hover:border-white'
                          }`}
                          style={{ backgroundColor: recentColor }}
                        />
                      ))}
                    </div>
                  </div>


                  {Object.entries(colorCategories).map(([categoryName, colors]) => (
                    <div key={categoryName} className="mb-4">
                      <p className={`text-xs font-medium mb-2 capitalize ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {categoryName}
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {colors.map((categoryColor, index) => (
                          <button
                            key={index}
                            onClick={() => handleColorSelect(categoryColor)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                              color === categoryColor 
                                ? 'border-white shadow-lg ring-2 ring-indigo-500' 
                                : 'border-white/50 hover:border-white'
                            }`}
                            style={{ backgroundColor: categoryColor }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } shadow-lg`}>
              <button
                onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
                className={`p-1 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <div 
                  className={`rounded-full ${
                    tool === 'eraser' ? 'bg-red-500' : 'bg-current'
                  }`}
                  style={{ 
                    width: `${Math.max(4, Math.min(lineWidth * 2, 20))}px`,
                    height: `${Math.max(4, Math.min(lineWidth * 2, 20))}px`,
                    color: tool === 'eraser' ? undefined : color
                  }}
                />
                <span className={`text-sm font-medium w-8 text-center ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {lineWidth}
                </span>
              </div>
              
              <button
                onClick={() => setLineWidth(Math.min(20, lineWidth + 1))}
                className={`p-1 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>


          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCanvas}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } shadow-lg`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={downloadCanvas}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } shadow-lg`}
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-600'
              } border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } shadow-lg`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>


      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <canvas
            ref={canvasRef}
            width={getCanvasSize().width}
            height={getCanvasSize().height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`cursor-crosshair transition-all duration-300 ${
              tool === 'eraser' ? 'cursor-not-allowed' : 'cursor-crosshair'
            }`}
            style={{ 
              backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
              touchAction: 'none'
            }}
          />
          

          <div className="sm:hidden absolute bottom-4 left-4 right-4">
            <div className={`flex items-center justify-between p-3 rounded-2xl backdrop-blur-md ${
              theme === 'dark' 
                ? 'bg-gray-900/90 border border-gray-700' 
                : 'bg-white/90 border border-gray-200'
            } shadow-2xl`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTool(tool === 'pen' ? 'eraser' : 'pen')}
                  className={`p-2 rounded-xl ${
                    tool === 'pen' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {tool === 'pen' ? <Pen className="w-4 h-4" /> : <Eraser className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`p-2 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: color }}
                  />
                </button>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
                    className={`p-1 rounded-lg ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`text-xs px-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {lineWidth}
                  </span>
                  <button
                    onClick={() => setLineWidth(Math.min(20, lineWidth + 1))}
                    className={`p-1 rounded-lg ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearCanvas}
                  className="p-2 rounded-xl bg-red-600 text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 rounded-xl bg-green-600 text-white"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          

          <div className={`absolute top-4 right-4 flex items-center gap-2`}>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              theme === 'dark' 
                ? 'bg-gray-900/80 text-gray-300 border border-gray-700' 
                : 'bg-white/80 text-gray-600 border border-gray-200'
            } backdrop-blur-md`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline">Room: </span>{room}
              </div>
            </div>
            <button
              onClick={leaveRoom}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-red-900/80 hover:bg-red-800 text-red-300 border border-red-700' 
                  : 'bg-red-50/80 hover:bg-red-100 text-red-600 border border-red-200'
              } backdrop-blur-md`}
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      <div className={`hidden sm:block sticky bottom-0 backdrop-blur-md transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-t border-gray-700' 
          : 'bg-white/80 border-t border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Tool: <span className="font-medium capitalize">{tool}</span>
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Size: <span className="font-medium">{lineWidth}px</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Real-time collaboration active
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}