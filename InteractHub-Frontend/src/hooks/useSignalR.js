import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const useSignalR = (onNotification) => {
  const connectionRef = useRef(null);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // ✅ Tránh connect 2 lần
    if (connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5022/hubs/notifications', {
        accessTokenFactory: () => localStorage.getItem('token')
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification) => {
      onNotificationRef.current?.(notification);
    });

    connection.start()
      .then(() => console.log('✅ SignalR connected'))
      .catch(err => console.error('❌ SignalR error:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);
};

export default useSignalR;