import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateRoomRequest, RoomResponse, JoinRoomRequest } from "@/types";
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('name');
    const roomId = searchParams.get('id');

    if (roomName) {
      const room = await prisma.room.findUnique({
        where: { name: roomName },
        include: {
          _count: {
            select: { drawings: true }
          }
        }
      });

      if (!room) {
        const response: RoomResponse = {
          success: false,
          message: "Room not found"
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: RoomResponse = {
        success: true,
        room
      };
      return NextResponse.json(response);
    }

    if (roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          _count: {
            select: { drawings: true }
          }
        }
      });

      if (!room) {
        const response: RoomResponse = {
          success: false,
          message: "Room not found"
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: RoomResponse = {
        success: true,
        room
      };
      return NextResponse.json(response);
    }

    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { drawings: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const response: RoomResponse = {
      success: true,
      rooms
    };
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching rooms:", error);
    const response: RoomResponse = {
      success: false,
      message: "Internal server error"
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomRequest = await request.json();
    const { name, password } = body;

    if (!name || name.trim().length === 0) {
      const response: RoomResponse = {
        success: false,
        message: "Room name is required"
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!password || password.length < 4) {
      const response: RoomResponse = {
        success: false,
        message: "Password must be at least 4 characters long"
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existingRoom = await prisma.room.findUnique({
      where: { name: name.trim() }
    });

    if (existingRoom) {
      const response: RoomResponse = {
        success: false,
        message: "Room already exists"
      };
      return NextResponse.json(response, { status: 409 });
    }

   const hashedPassword = await bcrypt.hash(password, 10);

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { drawings: true }
        }
      }
    });

    const response: RoomResponse = {
      success: true,
      room,
      message: "Room created successfully"
    };
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("Error creating room:", error);
    const response: RoomResponse = {
      success: false,
      message: "Internal server error"
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('name');
    const roomId = searchParams.get('id');
    
    const body = await request.json();
    const { password } = body;

    if (!roomName && !roomId) {
      const response: RoomResponse = {
        success: false,
        message: "Room name or ID is required"
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!password) {
      const response: RoomResponse = {
        success: false,
        message: "Password is required to delete room"
      };
      return NextResponse.json(response, { status: 400 });
    }

    const whereClause = roomName ? { name: roomName } : { id: roomId };

    const room = await prisma.room.findUnique({
      where: whereClause
    });

    if (!room) {
      const response: RoomResponse = {
        success: false,
        message: "Room not found"
      };
      return NextResponse.json(response, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, room.password);
    if (!isPasswordValid) {
      const response: RoomResponse = {
        success: false,
        message: "Invalid password"
      };
      return NextResponse.json(response, { status: 401 });
    }

    await prisma.room.delete({
      where: whereClause
    });

    const response: RoomResponse = {
      success: true,
      message: "Room deleted successfully"
    };
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error deleting room:", error);
    const response: RoomResponse = {
      success: false,
      message: "Internal server error"
    };
    return NextResponse.json(response, { status: 500 });
  }
}