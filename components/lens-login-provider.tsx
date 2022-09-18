import { useState, createContext, useContext } from "react";

const LensUserContext = createContext(null);

const LensLoginProvider = ({ children }) => {
  const [loggingInLens, setLoggingInLens] = useState(false);
  const [loggedInLens, setLoggedInLens] = useState(false);
  const [lensHandle, setLensHandle] = useState("");

  const value = {
    loggingInLens,
    setLoggingInLens,
    loggedInLens,
    setLoggedInLens,
    lensHandle,
    setLensHandle,
  };

  return (
    <LensUserContext.Provider value={value}>
      {children}
    </LensUserContext.Provider>
  );
};

export { LensUserContext, LensLoginProvider };
