import { useState, useEffect } from 'react';
import { Room, RoomResponse, AuthResponse } from '@/types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/room');
      const data: RoomResponse = await response.json();
      
      if (data.success && data.rooms) {
        setRooms(data.rooms);
      } else {
        setError(data.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name: string, password: string): Promise<Room | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data: RoomResponse = await response.json();
      
      if (data.success && data.room) {
        await fetchRooms(); // Refresh the list
        return data.room;
      } else {
        setError(data.message || 'Failed to create room');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const authenticateRoom = async (name: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/room/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        return true;
      } else {
        setError(data.message || 'Authentication failed');
        return false;
      }
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomName: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/room?name=${encodeURIComponent(roomName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data: RoomResponse = await response.json();
      
      if (data.success) {
        await fetchRooms(); // Refresh the list
        return true;
      } else {
        setError(data.message || 'Failed to delete room');
        return false;
      }
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    authenticateRoom,
    deleteRoom,
  };
};