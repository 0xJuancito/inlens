import Image from "next/image";
import styles from "../styles/TwitterLogin.module.css";
import {
  signIn as signInWithTwitter,
  signOut as signOutTwitter,
  useSession,
} from "next-auth/react";
import { useState, useEffect } from "react";

const TwitterLogin = () => {
  const { data } = useSession();

  const [loggedInTwitter, setLoggedInTwitter] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setLoggedInTwitter(Boolean(data?.user));

    const queryString = window.location.search;
    if (queryString === "?showlogin=true") {
      setShowLogin(true);
    }
  }, [data]);

  return (
    <button
      className={styles.twitterLogin}
      onClick={async (e) => {
        e.preventDefault();
        if (loggedInTwitter) {
          await signOutTwitter();
        } else {
          await signInWithTwitter("twitter");
        }
      }}
    >
      <Image
        unoptimized
        height="18"
        width="18"
        src="/twitter.svg"
        alt="twitter logo"
      ></Image>
      <span className={styles.twitterLoginText}>
        {loggedInTwitter ? "Disconnect" : "Connect"}
      </span>
    </button>
  );
};

export default TwitterLogin;
