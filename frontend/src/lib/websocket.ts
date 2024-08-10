let socket: WebSocket | null = null;

export const initializeWebSocket = () => {
  if (!socket) {
    socket = new WebSocket('ws://localhost:8000/ws/notifications/');
  }
  return socket;
};

export const getWebSocket = () => socket;

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
