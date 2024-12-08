/// <reference types="node" />
import React, { useEffect, useState } from 'react';

interface Notification {
  notification: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL + '/ws/notifications/');
    ws.onmessage = (e) => {
      const data: Notification = JSON.parse(e.data);
      setNotifications((prevNotifications) => [...prevNotifications, data.notification]);
    };
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendNotification = () => {
    if (socket && message) {
      socket.send(JSON.stringify({ notification: message }));
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      <div>
        {notifications.map((note, index) => (
          <div key={index}>{note}</div>
        ))}
      </div>
      <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
};

export default Notifications;
