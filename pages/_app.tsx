import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import { useState, createContext, useContext } from "react";

export const UserContext = createContext(null);

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={user}>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </UserContext.Provider>
  );
}

export default MyApp;
