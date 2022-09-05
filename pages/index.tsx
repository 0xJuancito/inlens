/* eslint-disable @next/next/no-page-custom-font */
import Head from "next/head";
import Image from "next/image";
import { useRef, useState, useEffect, SetStateAction } from "react";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { login } from "../lib/login";
import { getDefaultProfile } from "../lib/get-default-profile";
import ClaimPopup from "../components/popup";
import { setAuthenticationToken } from "../lib/state";
import jwt from "jsonwebtoken";
import { setAddress, setSigner } from "../lib/ethers.service";
import { refresh } from "../lib/refresh";

export default function Home() {
  const [waiting, setWaiting] = useState(false);

  const [loggingIn, setLoggingIn] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [lensHandle, setLensHandle] = useState("");

  const [frens, setFrens] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [instance, setInstance] = useState<any>();

  const twitterInput = useRef(null);
  const claimPopup = useRef(null);

  const onChangeHandler = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const newModal = new Web3Modal({
      // cacheProvider: true,
      providerOptions: {},
      network: "matic",
    });
    setWeb3Modal(newModal);
    if (twitterInput.current) twitterInput.current.focus();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const handle = localStorage.getItem("lens_handle");
      let accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!handle || !accessToken || !refreshToken) {
        clearProfile();
        return;
      }

      try {
        const decodedAccess = jwt.decode(accessToken, { json: true });
        const decodedRefresh = jwt.decode(refreshToken, { json: true });

        if (Date.now() >= decodedRefresh.exp * 1000) {
          clearProfile();
          return;
        }

        if (Date.now() >= decodedAccess.exp * 1000) {
          const newTokens = await refresh(decodedRefresh.id, refreshToken);
          storeProfile(handle, newTokens);
          accessToken = newTokens.accessToken;
        }
        setAddress(decodedRefresh.id);
      } catch (error) {
        clearProfile();
        console.error(error);
        return;
      }

      setLensHandle(handle);
      setLoggedIn(true);
      setAuthenticationToken(accessToken);
    };
    loadProfile();
  }, []);

  const clearProfile = () => {
    localStorage.removeItem("lens_handle");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const storeProfile = (handle: string, authorization: any) => {
    localStorage.setItem("lens_handle", handle);
    localStorage.setItem("access_token", authorization.accessToken);
    localStorage.setItem("refresh_token", authorization.refreshToken);
  };

  const connect = async () => {
    if (loggingIn) {
      return;
    }
    try {
      setLoggingIn(true);
      const newInstance = await web3Modal.connect();
      setInstance(newInstance);

      const provider = new ethers.providers.Web3Provider(newInstance);
      const signer = provider.getSigner();
      setSigner(signer);

      const address = await signer.getAddress();
      const accessToken = await login(address);

      const response = await getDefaultProfile();
      if (!response.defaultProfile) {
        claimPopup.current.open();
        setLoggingIn(false);
        return;
      }

      storeProfile(response.defaultProfile.handle, accessToken.authenticate);

      setLensHandle(response.defaultProfile.handle);
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
    setLoggingIn(false);
  };

  const makeRequest = async () => {
    if (waiting) {
      return;
    }
    setWaiting(true);

    const parsedValue = inputValue.replaceAll("@", "");

    if (!parsedValue) {
      setWaiting(false);
      return;
    }
    try {
      const res = await fetch(`/api/frens?username=${parsedValue}`);

      setFrens([]);
      setErrorMessage("");

      if (res.status === 200) {
        const newFrens = await res.json();
        if (newFrens.length) {
          setFrens(newFrens);
        } else {
          setErrorMessage("No friend was found :(");
        }
      } else {
        setErrorMessage(
          "Too many requests. Please try again in a few minutes ⌛️"
        );
      }

      setWaiting(false);
    } catch (err) {
      console.log(err);
      setWaiting(false);
    }
  };

  const frensList = () => {
    if (!frens?.length) {
      return "";
    }

    const twitterUrl = (handle: string) => `https://twitter.com/${handle}`;
    const lensUrl = (handle: string) =>
      `https://lensfrens.xyz/${handle.toLowerCase()}`;

    return (
      <div className={styles.frensContainer}>
        <div>
          Found {frens.length} frens in Lens! {"🤎"}
        </div>
        <ul>
          {frens.map((fren) => (
            <li key={fren.twitter}>
              <a
                className={styles.twitter}
                href={twitterUrl(fren.twitter)}
                target={"_blank"}
                rel={"noreferrer"}
              >
                @{fren.twitter}
              </a>
              {"=>"} {" 🌿"}
              <a
                className={styles.lens}
                href={lensUrl(fren.lens)}
                target={"_blank"}
                rel={"noreferrer"}
              >
                {fren.lens}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderHeart = () => {
    return (
      <span className={styles.ldsheart}>
        <div></div>
      </span>
    );
  };

  const renderLoading = () => {
    if (!loggingIn) {
      return "";
    }
    return (
      <span className={styles.ldsring}>
        <div></div>
      </span>
    );
  };

  const renderLoginImage = () => {
    if (loggingIn) {
      return "";
    }
    return (
      <Image height="40" width="40" src="/lens.svg" alt="Lens Logo"></Image>
    );
  };

  const renderLogin = () => {
    return (
      <button
        className={styles.signIn}
        onClick={() => connect()}
        disabled={loggingIn}
      >
        {renderLoginImage()}
        {renderLoading()}
        <span>Login</span>
      </button>
    );
  };

  const displayLoggedInMenu = async () => {
    console.log(await getDefaultProfile());
  };

  const renderLoggedIn = () => {
    return (
      <button className={styles.signIn} onClick={() => displayLoggedInMenu()}>
        <Image height="40" width="40" src="/lens.svg" alt="Lens Logo"></Image>
        <span>{lensHandle}</span>
      </button>
    );
  };

  return (
    <div>
      <header>
        <nav>
          <div className={styles.inlensContainer}>
            <Image
              height="48"
              width="48"
              src="/birdie.svg"
              alt="inlens logo"
            ></Image>
            <span className={styles.inlensText}>inlens</span>
          </div>
          {loggedIn ? renderLoggedIn() : renderLogin()}
        </nav>
      </header>
      <div className={styles.container}>
        <Head>
          <title>Who is in Lens?</title>
          <meta
            name="description"
            content="​Find your friends from Twitter in Lens Protocol 🌿"
          />
          <link rel="icon" href="/favicon.ico" />

          {/* <!-- Primary Meta Tags --> */}
          <title>Who is in Lens?</title>
          <meta name="title" content="Who is in Lens?" />
          <meta
            name="description"
            content="​Find your friends from Twitter in Lens Protocol"
          />

          {/* <!-- Open Graph / Facebook --> */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://inlens.xyz/" />
          <meta property="og:title" content="Who is in Lens?" />
          <meta
            property="og:description"
            content="​Find your friends from Twitter in Lens Protocol"
          />
          <meta property="og:image" content="https://inlens.xyz/inlens.png" />

          {/* <!-- Twitter --> */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://inlens.xyz/" />
          <meta property="twitter:title" content="Who is in Lens?" />
          <meta
            property="twitter:description"
            content="​Find your friends from Twitter in Lens Protocol"
          />
          <meta
            property="twitter:image"
            content="https://inlens.xyz/inlens.png"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&amp;display=swap"
            rel="preload"
          ></link>
        </Head>
        <main className={styles.main}>
          <h1 className={styles.title}>WHO IS IN LENS?</h1>
          <p className={styles.description}>
            ​Find your friends from Twitter in Lens Protocol 🌿
          </p>
          <div className={styles.inputContainer}>
            <div className={styles.twitterInputContainer}>
              <span className={styles.twitterInputAt}>@</span>
              <input
                type="text"
                name="twitterInput"
                className={styles.twitterInput}
                ref={twitterInput}
                value={inputValue}
                onChange={onChangeHandler}
                placeholder="TwitterHandle"
              ></input>
            </div>
            <button onClick={() => makeRequest()}>Find Frens!</button>
          </div>
          <div className={styles.pleaseWait}>
            {waiting === true ? "Finding frens in Lens. Please wait :)" : ""}
          </div>
          <div>{waiting === true ? "It takes up to 10 seconds ⌛️" : ""}</div>
          {waiting === true ? renderHeart() : ""}
          <div>{!waiting && errorMessage}</div>
          <div>{!waiting && frensList()}</div>
        </main>

        <footer className={styles.footer}>
          <span role="img" aria-label="sheep">
            Built with 🌿 by
          </span>
          <a href="https://www.lensfrens.xyz/juancito.lens" target="blank">
            juancito.lens
          </a>
          &nbsp; | &nbsp;
          <a
            href="https://github.com/juanscolari/who-is-in-lens"
            target={"_blank"}
            rel={"noreferrer"}
          >
            GitHub
          </a>
        </footer>
      </div>
      <ClaimPopup ref={claimPopup}></ClaimPopup>
    </div>
  );
}
