import { useEffect, useRef, useState } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useSelector } from 'react-redux';

const useSocket = () => {
  const { token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [token]);

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, isConnected, on, off, emit };
};

export default useSocket;
