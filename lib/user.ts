import { setAddress } from "./ethers.service";
import jwt from "jsonwebtoken";
import { refresh } from "./refresh";
import { setAuthenticationToken } from "./state";

export const clearProfile = () => {
  localStorage.removeItem("lens_handle");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const storeProfile = (handle: string, authorization: any) => {
  localStorage.setItem("lens_handle", handle);
  localStorage.setItem("access_token", authorization.accessToken);
  localStorage.setItem("refresh_token", authorization.refreshToken);
};

export const loadProfile = async (): Promise<string> => {
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

    setAuthenticationToken(accessToken);
    return handle;
  } catch (error) {
    clearProfile();
    console.error(error);
    return;
  }
};
