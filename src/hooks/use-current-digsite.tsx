import React, { createContext, useContext, useState } from "react";

const DigsiteContext = createContext<any>(null);

export const useDigsite = () => {
  const [currentDigsite, setCurrentDigsite] = useContext(DigsiteContext);

  return {
    currentDigsite,
    setCurrentDigsite,
  };
};

export const DigsiteProvider = ({ children }: any) => {
  const [currentDigsite, setCurrentDigsite] = useState(null);

  return (
    <DigsiteContext.Provider value={[currentDigsite, setCurrentDigsite]}>
      {children}
    </DigsiteContext.Provider>
  );
};
