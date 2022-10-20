import { useContext, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/LensLogin.module.css";
import { LensUserContext } from "./lens-login-provider";
import { Menu, MenuItem, MenuButton, SubMenu } from "@szhsin/react-menu";
import { setAddress } from "../lib/ethers.service";
import { setAuthenticationToken } from "../lib/state";
import { clearProfile, loadProfile } from "../lib/user";

const LensLogin = () => {
  const {
    loggingInLens,
    setLoggingInLens,
    loggedInLens,
    setLoggedInLens,
    lensHandle,
    setLensHandle,
    connect,
  } = useContext(LensUserContext);

  useEffect(() => {
    loadProfile().then((handle) => {
      if (handle) {
        setLoggedInLens(true);
        setLensHandle(handle);
      }
    });
  }, [setLoggedInLens, setLensHandle]);

  const renderLoginImage = () => {
    if (loggingInLens) {
      return "";
    }
    return (
      <Image
        unoptimized
        height="40"
        width="40"
        src="/lens.svg"
        alt="Lens Logo"
      ></Image>
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
              unoptimized
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

  return <div>{loggedInLens ? renderLoggedInLens() : renderLogin()}</div>;
};

export default LensLogin;
