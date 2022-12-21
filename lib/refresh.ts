import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { getAddressFromSigner } from "./ethers.service";

const REFRESH_AUTHENTICATION = `
  mutation($request: RefreshRequest!) { 
    refresh(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

const refreshAuth = (refreshToken: string) => {
  return apolloClient.mutate({
    mutation: gql(REFRESH_AUTHENTICATION),
    variables: {
      request: {
        refreshToken,
      },
    },
  });
};

export const refresh = async (
  address = getAddressFromSigner(),
  refreshToken: string
) => {
  console.log("refresh: address", address);

  // const accessTokens = await login(address);

  const newAccessToken = await refreshAuth(
    refreshToken
    // accessTokens.authenticate.refreshToken
  );

  return newAccessToken.data.refresh;
};
