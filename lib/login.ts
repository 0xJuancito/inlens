import { gql } from "@apollo/client/core";
import { ethers, Wallet } from "ethers";
import { apolloClient } from "./apollo-client";
import { setSigner, signText } from "./ethers.service";
import { getDefaultProfile } from "./get-default-profile";
import { getAuthenticationToken, setAuthenticationToken } from "./state";

const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;

export const generateChallenge = (address: string) => {
  return apolloClient.query({
    query: gql(GET_CHALLENGE),
    variables: {
      request: {
        address,
      },
    },
  });
};

const AUTHENTICATION = `
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

const authenticate = (address: string, signature: string) => {
  return apolloClient.mutate({
    mutation: gql(AUTHENTICATION),
    variables: {
      request: {
        address,
        signature,
      },
    },
  });
};

export const login = async (address?: string) => {
  if (!address) {
    console.log("login: no address provided");
    return;
  }

  if (getAuthenticationToken()) {
    console.log("login: already logged in");
    return;
  }

  console.log("login: address", address);

  // we request a challenge from the server
  const challengeResponse = await generateChallenge(address);

  // sign the text with the wallet
  const signature = await signText(challengeResponse.data.challenge.text);

  const accessTokens = await authenticate(address, signature);

  setAuthenticationToken(accessTokens.data.authenticate.accessToken);

  return accessTokens.data;
};
