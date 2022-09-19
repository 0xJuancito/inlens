import { createContext, useState } from "react";

const LensFriendsContext = createContext(null);

const LensFriendsProvider = ({ children }) => {
  const [frens, setFrens] = useState([]);

  const value = { frens, setFrens };

  return (
    <LensFriendsContext.Provider value={value}>
      {children}
    </LensFriendsContext.Provider>
  );
};

export { LensFriendsContext, LensFriendsProvider };
