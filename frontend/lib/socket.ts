import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000'

class SocketService {
  private socket: Socket | null = null

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
      })
    }
    
    if (!this.socket.connected) {
      this.socket.connect()
    }
    
    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  joinMission(missionId: string): void {
    if (this.socket) {
      this.socket.emit('joinMission', missionId)
    }
  }

  leaveMission(missionId: string): void {
    if (this.socket) {
      this.socket.emit('leaveMission', missionId)
    }
  }
}

export const socketService = new SocketService()
export default socketService