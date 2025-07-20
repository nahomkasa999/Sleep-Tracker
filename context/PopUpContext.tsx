import React, { createContext, useContext, useState, ReactNode } from 'react'
///this code made me stare on screen for more that 5+ hour use becuse I missed to warp the BottomNav <provider>{childern}</provider> <BottomNav> 
///and I was just blind to see it 
/// but it's a relief and great to both solve and state at the screen to digbug because that is what codes do, I love everthing about this life

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