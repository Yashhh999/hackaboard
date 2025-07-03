export interface Room {
  id: string
  name: string
  password?: string 
  createdAt: Date
  updatedAt: Date
  _count?: {
    drawings: number
  }
}

export interface DrawData {
  id?: string
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  room: string
  timestamp?: Date
}

export interface CreateRoomRequest {
  name: string
  password: string
}

export interface JoinRoomRequest {
  name: string
  password: string
}

export interface RoomResponse {
  success: boolean
  room?: Room
  rooms?: Room[]
  message?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  token?: string
}