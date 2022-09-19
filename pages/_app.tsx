import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import { LensLoginProvider } from "../components/lens-login-provider";
import { LensFriendsProvider } from "../components/lens-friends-provider";

function MyApp({ Component, pageProps }) {
  return (
    <LensFriendsProvider>
      <LensLoginProvider>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </LensLoginProvider>
    </LensFriendsProvider>
  );
}

export default MyApp;
