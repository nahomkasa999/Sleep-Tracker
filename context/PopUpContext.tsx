'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
interface PopupContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const PopupContext = createContext<PopupContextType | undefined>(undefined)
interface PopupProviderProps {
  children: ReactNode; 
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const contextValue = {
    isOpen,
    setIsOpen,
  };

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopupContext = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopupContext must be used within a PopupProvider');
  }
  return context;
};