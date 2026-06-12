import { io, type Socket } from 'socket.io-client'

type CB = (...args: unknown[]) => void

class SocketManager {
    private socket: Socket | null = null
    private listeners: Map<string, CB[]> = new Map()

    connect(token: string) {
        if (this.socket?.connected) return

        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        this.socket.on('connect', () => {
            console.log('[Socket] Connected')
        })

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason)
            if (reason === 'io server disconnect') {
                this.socket?.connect()
            }
        })

        this.socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message)
        })

        // Re-attach stored listeners after reconnect
        this.listeners.forEach((cbs, event) => {
            cbs.forEach((cb) => this.socket?.on(event, cb))
        })
    }

    disconnect() {
        this.socket?.disconnect()
        this.socket = null
        this.listeners.clear()
    }

    emit(event: string, data?: unknown) {
        if (!this.socket?.connected) return
        this.socket.emit(event, data)
    }

    on(event: string, cb: CB) {
        if (!this.listeners.has(event)) this.listeners.set(event, [])
        this.listeners.get(event)!.push(cb)
        this.socket?.on(event, cb)
    }

    off(event: string, cb: CB) {
        const updated = (this.listeners.get(event) ?? []).filter((f) => f !== cb)
        this.listeners.set(event, updated)
        this.socket?.off(event, cb)
    }

    isConnected() {
        return this.connected
    }

    get connected() {
        return this.socket?.connected ?? false
    }
}

export const socketManager = new SocketManager()
