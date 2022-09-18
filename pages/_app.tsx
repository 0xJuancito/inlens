import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import { useState } from "react";
import { LensLoginProvider } from "../components/lens-login-provider";

function MyApp({ Component, pageProps }) {
  return (
    <LensLoginProvider>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </LensLoginProvider>
  );
}

export default MyApp;
