import { createContext, useContext, useState } from "react";

const AppCtx = createContext();

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function toast(msg, type = "success") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3000);
  }

  return (
    <AppCtx.Provider value={{ toast }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}