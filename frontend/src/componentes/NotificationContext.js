import React, { createContext, useState, useCallback } from "react";
import Notification from "./Notification"; // Importar el componente Notification

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type, message, options = {}) => {
    const id = Date.now();
    const { persistent = false, timeout = 2000 } = options;
    
    setNotifications(prev => [...prev, { id, type, message, persistent }]);
    
    if (!persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
  }, [removeNotification]); // Añadir removeNotification como dependencia

  const contextValue = {
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-wrapper">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            persistent={notification.persistent}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};