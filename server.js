const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    await handle(req, res, parsedUrl)
  })

  const io = new Server(server)

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', async (roomName) => {
      socket.join(roomName)
      console.log(`🔗 User ${socket.id} joined room ${roomName}`)
      
      try {
        const room = await prisma.room.findUnique({
          where: { name: roomName },
          include: { drawings: true }
        })

        if (room) {
          console.log(`📊 Room ${roomName} has ${room.drawings.length} drawings`)
          socket.emit('load-drawings', room.drawings)
        } else {
          console.log(`⚠️  Room ${roomName} not found in database`)
          socket.emit('load-drawings', [])
        }
      } catch (error) {
        console.error('❌ Error loading room drawings:', error)
        socket.emit('load-drawings', [])
      }
    })

    socket.on('draw', async (data) => {
      try {
        const room = await prisma.room.findUnique({
          where: { name: data.room }
        })

        if (room) {
          const drawing = await prisma.drawing.create({
            data: {
              roomId: room.id,
              x: data.x,
              y: data.y,
              prevX: data.prevX,
              prevY: data.prevY,
              color: data.color,
              lineWidth: data.lineWidth,
              isEraser: data.isEraser || false
            }
          })
          console.log(`✏️  Saved ${data.isEraser ? 'eraser' : 'drawing'} stroke for room ${data.room}`)
        } else {
          console.log(`⚠️  Room ${data.room} not found when saving drawing`)
        }
      } catch (error) {
        console.error('❌ Error saving drawing:', error)
      }

      socket.to(data.room).emit('draw', data)
    })

    socket.on('clear-canvas', async (roomName) => {
      const room = await prisma.room.findUnique({
        where: { name: roomName }
      })

      if (room) {
        await prisma.drawing.deleteMany({
          where: { roomId: room.id }
        })
      }

      socket.to(roomName).emit('clear-canvas')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})