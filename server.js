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
      
      // Only load existing drawings, don't create room here
      // Rooms must be created through the API with password
      const room = await prisma.room.findUnique({
        where: { name: roomName },
        include: { drawings: true }
      })

      if (room) {
        socket.emit('load-drawings', room.drawings)
      }

      console.log(`User ${socket.id} joined room ${roomName}`)
    })

    socket.on('draw', async (data) => {
      const room = await prisma.room.findUnique({
        where: { name: data.room }
      })

      if (room) {
        await prisma.drawing.create({
          data: {
            roomId: room.id,
            x: data.x,
            y: data.y,
            prevX: data.prevX,
            prevY: data.prevY,
            color: data.color,
            lineWidth: data.lineWidth
          }
        })
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