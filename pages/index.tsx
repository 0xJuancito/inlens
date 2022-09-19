/* eslint-disable @next/next/no-page-custom-font */
import Image from "next/image";
import { useRef, useState, useEffect, SetStateAction, useContext } from "react";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { login } from "../lib/login";
import { getDefaultProfile } from "../lib/get-default-profile";
import { setAuthenticationToken } from "../lib/state";
import jwt from "jsonwebtoken";
import { setAddress, setSigner } from "../lib/ethers.service";
import { refresh } from "../lib/refresh";
import { Menu, MenuItem, MenuButton, SubMenu } from "@szhsin/react-menu";
import {
  AuthorizationError,
  findFrens,
  modifyFollows,
  TooManyRequestsError,
} from "../lib/find-frens";
import { freeFollow } from "../lib/follow";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { Store } from "react-notifications-component";
import { profiles } from "../lib/get-profiles";

import ClaimPopup from "../components/popup";
import Footer from "../components/footer";
import AppHead from "../components/app-head";
import InlensLogoNav from "../components/inlens-logo-nav";
import TwitterLogin from "../components/twitter-login";
import { signOut, useSession } from "next-auth/react";
import { clearProfile, loadProfile, storeProfile } from "../lib/user";
import { LensUserContext } from "../components/lens-login-provider";

export default function Home() {
  const { data } = useSession();

  const {
    loggingInLens,
    setLoggingInLens,
    loggedInLens,
    setLoggedInLens,
    lensHandle,
    setLensHandle,
  } = useContext(LensUserContext);

  const [waiting, setWaiting] = useState(false);

  const [frens, setFrens] = useState([]);
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
    loadProfile().then((handle) => {
      if (handle) {
        setLoggedInLens(true);
        setLensHandle(handle);
      }
    });
  }, [setLoggedInLens, setLensHandle]);

  const checkProvider = async () => {};

  const followRequest = async (id: string) => {
    const notifySuccess = () => {
      Store.addNotification({
        title: "Transaction sent!",
        message: "You will see the update in a few seconds!",
        type: "success",
        insert: "bottom",
        container: "bottom-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    };

    const newFrens = [...frens];
    const fren = newFrens.find((fren) => fren.lens.id === id);
    if (fren.lens.waitingFollow || fren.lens.follows) {
      return;
    }
    fren.lens.waitingFollow = true;
    setFrens(newFrens);

    try {
      const connected = await connect();
      if (!connected) {
        throw new Error("Sign in failed");
      }
      const newFrensConnect = [...frens];
      const frenConnect = newFrensConnect.find((fren) => fren.lens.id === id);
      frenConnect.lens.follows = true;
      setFrens(newFrensConnect);

      await freeFollow(id);

      const newFrens = [...frens];
      const fren = newFrens.find((fren) => fren.lens.id === id);
      fren.lens.follows = true;
      fren.lens.waitingFollow = false;
      setFrens(newFrens);

      notifySuccess();
    } catch (err) {
      const errorMessage =
        err.message || "Please try again in a few seconds 🙏";

      const newFrens = [...frens];
      const fren = newFrens.find((fren) => fren.lens.id === id);
      fren.lens.waitingFollow = false;
      setFrens(newFrens);
      console.error(err);

      if (errorMessage === "You are already following this profile") {
        notifySuccess();
      } else if (errorMessage !== "Sign in failed") {
        fren.lens.follows = false;
        Store.addNotification({
          title: "There was an error",
          message: errorMessage,
          type: "danger",
          insert: "bottom",
          container: "bottom-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 5000,
            onScreen: true,
          },
        });
      }
    }
  };

  const connect = async (): Promise<boolean> => {
    if (!window.ethereum) {
      Store.addNotification({
        title: "No wallet found",
        message: "Please install a wallet to use the app",
        type: "danger",
        insert: "bottom",
        container: "bottom-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
      return false;
    }

    if (loggingInLens) {
      return false;
    }
    if (loggedInLens) {
      return true;
    }
    try {
      setLoggingInLens(true);
      const newInstance = await web3Modal.connect();
      setInstance(newInstance);

      const provider = new ethers.providers.Web3Provider(newInstance);
      const signer = provider.getSigner();
      setSigner(signer);

      const address = await signer.getAddress();
      const accessToken = await login(address);

      const response = await getDefaultProfile();
      let defaultProfile = response?.defaultProfile?.handle;

      if (!defaultProfile) {
        const profilesResponse = await profiles({
          ownedBy: address,
        });

        defaultProfile =
          profilesResponse?.profiles?.items &&
          profilesResponse?.profiles?.items[0]?.handle;
      }

      if (!defaultProfile) {
        claimPopup.current.open();
        setLoggingInLens(false);
        setAuthenticationToken(null);
        return;
      }

      try {
        if (frens.length) {
          const newFrens = [...frens];
          await modifyFollows(address, newFrens);
          setFrens(newFrens);
        }
      } catch (err) {
        console.error(err);
      }

      storeProfile(defaultProfile, accessToken.authenticate);

      setLensHandle(defaultProfile);
      setLoggedInLens(true);
      setLoggingInLens(false);

      return true;
    } catch (error) {
      console.error(error);
      setLoggingInLens(false);
      return false;
    }
  };

  const findFrensRequest = async () => {
    if (waiting) {
      return;
    }
    setWaiting(true);

    const twitterHandle = inputValue.replaceAll("@", "");
    if (!twitterHandle) {
      setWaiting(false);
      return;
    }

    setFrens([]);

    try {
      let accessToken = localStorage.getItem("access_token");
      const decoded = jwt.decode(accessToken, { json: true });
      const address = decoded?.id;

      const newFrens = await findFrens(twitterHandle, address);

      if (newFrens.length) {
        setFrens(newFrens);
      } else {
        Store.addNotification({
          title: "No friend was found :(",
          type: "danger",
          insert: "bottom",
          container: "bottom-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 5000,
            onScreen: true,
          },
        });
      }
    } catch (err) {
      let title = "No frens found :(";
      let message = "There are no Lens frens for that profile";

      if (err instanceof TooManyRequestsError) {
        title = "No slots available";
        message =
          "Connect Twitter to skip the line or try again in a few minutes ⌛️";
      }
      if (err instanceof AuthorizationError) {
        title = "Authorization Error";
        message = "Your Twitter session has expired. Please login again";
        await signOut();
      }

      Store.addNotification({
        title: title,
        message: message,
        type: "danger",
        insert: "bottom",
        container: "bottom-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    }
    setWaiting(false);
  };

  const frensList = () => {
    if (!frens?.length) {
      return "";
    }

    const twitterUrl = (handle: string) => `https://twitter.com/${handle}`;
    const lensUrl = (handle: string) =>
      `https://lensfrens.xyz/${handle.toLowerCase()}`;

    const renderFollowing = (fren) => {
      if (fren.lens?.follows) {
        return <button className={styles.following}>{"Following"}</button>;
      } else {
        return (
          <button
            className={styles.follow}
            onClick={() => followRequest(fren.lens.id)}
          >
            <Image
              height="40"
              width="40"
              src="/lens.svg"
              alt="Lens Logo"
            ></Image>
            {"Follow"}
          </button>
        );
      }
    };

    const defaultAvatar =
      "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

    return (
      <div className={styles.frensContainer}>
        <ul>
          {frens.map((fren) => (
            <li className={styles.userCard} key={fren.twitter.handle}>
              <div className={styles.avatarContainer}>
                <Image
                  height="48"
                  width="48"
                  src={fren.twitter.avatar || defaultAvatar}
                  alt="User Avatar"
                ></Image>
              </div>
              <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileNameContainer}>
                    <div className={styles.profileName}>
                      {fren.twitter.name}
                    </div>
                    <div>
                      <a
                        className={styles.twitter}
                        href={twitterUrl(fren.twitter.handle)}
                        target={"_blank"}
                        rel={"noreferrer"}
                      >
                        @{fren.twitter.handle}
                      </a>
                      {" | "}
                      <a
                        className={styles.lens}
                        href={lensUrl(fren.lens.handle)}
                        target={"_blank"}
                        rel={"noreferrer"}
                      >
                        {fren.lens.handle}
                      </a>
                    </div>
                  </div>
                  {renderFollowing(fren)}
                </div>

                <div className={styles.profileDescription}>
                  {fren.twitter.description}
                </div>
              </div>
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
    if (!loggingInLens) {
      return "";
    }
    return (
      <span className={styles.ldsring}>
        <div></div>
      </span>
    );
  };

  const renderLoginImage = () => {
    if (loggingInLens) {
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
        disabled={loggingInLens}
      >
        {renderLoginImage()}
        {renderLoading()}
        <span>Login</span>
      </button>
    );
  };

  const logout = async () => {
    setLoggedInLens(false);
    setAddress(null);
    setAuthenticationToken(null);
    clearProfile();
  };

  const renderLoggedInLens = () => {
    return (
      <Menu
        align="end"
        menuButton={
          <MenuButton className={styles.signIn}>
            <Image
              height="40"
              width="40"
              src="/lens.svg"
              alt="Lens Logo"
            ></Image>
            <span>{lensHandle}</span>
          </MenuButton>
        }
      >
        <MenuItem className={styles.logout} onClick={() => logout()}>
          Logout
        </MenuItem>
      </Menu>
    );
  };

  return (
    <div>
      <AppHead></AppHead>
      <ReactNotifications />
      <header>
        <nav>
          <InlensLogoNav></InlensLogoNav>
          <div className={styles.loginContainer}>
            <TwitterLogin></TwitterLogin>
            {loggedInLens ? renderLoggedInLens() : renderLogin()}
          </div>
        </nav>
      </header>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>WHO IS IN LENS?</h1>
          <p className={styles.description}>
            ​Find your friends from Twitter in Lens Protocol 🌿
          </p>

          <div>
            <label className={styles.yourTwitterHandle}>
              Your Twitter handle:
            </label>
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
                  placeholder="LensProtocol"
                ></input>
              </div>
              <button onClick={() => findFrensRequest()}>Find Frens!</button>
            </div>
          </div>

          <div className={styles.pleaseWait}>
            {waiting === true ? "Finding frens in Lens. Please wait :)" : ""}
          </div>
          <div>{waiting === true ? "It takes up to 10 seconds ⌛️" : ""}</div>
          {waiting === true ? renderHeart() : ""}
          {!data?.user && !waiting && !frens?.length ? (
            <div>
              💡 <span className={styles.tip}>Connect Twitter</span> and skip
              the line!
            </div>
          ) : (
            ""
          )}

          <div>{!waiting && frensList()}</div>
        </main>

        <Footer></Footer>
      </div>
      <ClaimPopup ref={claimPopup}></ClaimPopup>
    </div>
  );
}
