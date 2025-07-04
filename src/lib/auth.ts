export function validateAuthToken(roomName: string, providedToken: string): boolean {
  const expectedToken = `hackmate_auth_${roomName}`
  return providedToken === expectedToken
}

export function generateAuthToken(roomName: string): string {
  return `hackmate_auth_${roomName}`
}

export function isValidRoomName(roomName: string): boolean {
  return Boolean(roomName && roomName.trim().length > 0)
}
