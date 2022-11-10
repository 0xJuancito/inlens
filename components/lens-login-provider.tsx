import { ethers } from "ethers";
import { useState, createContext, useEffect, useRef, useContext } from "react";
import { Store } from "react-notifications-component";
import { setSigner } from "../lib/ethers.service";
import { getDefaultProfile } from "../lib/get-default-profile";
import { profiles } from "../lib/get-profiles";
import { login } from "../lib/login";
import Web3Modal from "web3modal";
import { setAuthenticationToken } from "../lib/state";
import ClaimPopup from "../components/popup";
import { storeProfile } from "../lib/user";
import { modifyFollows } from "../lib/find-frens";
import { LensFriendsContext } from "./lens-friends-provider";
import { sortFrens } from "../lib/frens";

const LensUserContext = createContext(null);

const LensLoginProvider = ({ children }) => {
  const { frens, setFrens } = useContext(LensFriendsContext);

  const [loggingInLens, setLoggingInLens] = useState(false);
  const [loggedInLens, setLoggedInLens] = useState(false);
  const [lensHandle, setLensHandle] = useState("");

  const [instance, setInstance] = useState<any>();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();

  const claimPopup = useRef(null);

  useEffect(() => {
    const newModal = new Web3Modal({
      // cacheProvider: true,
      providerOptions: {},
      network: "matic",
    });
    setWeb3Modal(newModal);
  }, []);

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
          let newFrens = sortFrens([...frens]);
          await modifyFollows(address, newFrens);
          newFrens = sortFrens(newFrens);
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

  const value = {
    loggingInLens,
    setLoggingInLens,
    loggedInLens,
    setLoggedInLens,
    lensHandle,
    setLensHandle,
    connect,
  };

  return (
    <LensUserContext.Provider value={value}>
      {children}
      <ClaimPopup ref={claimPopup}></ClaimPopup>
    </LensUserContext.Provider>
  );
};

export { LensUserContext, LensLoginProvider };
