import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JoinRoomRequest, AuthResponse } from "@/types";
import bcrypt from 'bcryptjs';

// POST - Authenticate room password
export async function POST(request: NextRequest) {
  try {
    const body: JoinRoomRequest = await request.json();
    const { name, password } = body;

    if (!name || name.trim().length === 0) {
      const response: AuthResponse = {
        success: false,
        message: "Room name is required"
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!password || password.length === 0) {
      const response: AuthResponse = {
        success: false,
        message: "Password is required"
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Find room
    const room = await prisma.room.findUnique({
      where: { name: name.trim() }
    });

    if (!room) {
      const response: AuthResponse = {
        success: false,
        message: "Room not found"
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, room.password);

    if (!passwordMatch) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid password"
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: AuthResponse = {
      success: true,
      message: "Authentication successful"
    };
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error authenticating room:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    return NextResponse.json(response, { status: 500 });
  }
}
