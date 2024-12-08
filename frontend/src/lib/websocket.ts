let socket: WebSocket | null = null;

export const initializeWebSocket = () => {
  if (!socket) {
    socket = new WebSocket((process.env.REACT_APP_WS_URL as string) + '/ws/notifications/');
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
