import {io, type Socket} from 'socket.io-client'

let socket: Socket | null = null ; 

// creating the instance only once 

export const getSocket = (): Socket => {
    if(!socket) {
        socket = io(
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', 
            {
                autoConnect: false 
            }
        )
    }
    return socket ; 
}

export const connectSocket = (
    role: string, 
    author_id?: string | null 
): void => {
    const s = getSocket() ; 

    if(!s.connected){
        s.connect() ; 
    }

    s.on('connect', () => {
        if(role === 'author' && author_id){
            s.emit('join:author', author_id) ; 
        } else if(role === 'admin'){
            s.emit('join:admin') ; 
        }
    })
}

export const disconnectSocket = (): void => {
    if(socket?.connected){
        socket.disconnect() ; 
    }
}