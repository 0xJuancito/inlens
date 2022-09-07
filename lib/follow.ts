import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { login } from "./login";

const CREATE_FREE_FOLLOW_DATA = `
    mutation ProxyAction($request: ProxyActionRequest!) {
        proxyAction(request: $request)
    }
`;

const createfreeFollow = (profileId: string) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_FREE_FOLLOW_DATA),
    variables: {
      request: {
        follow: {
          freeFollow: {
            profileId,
          },
        },
      },
    },
  });
};

export const freeFollow = async (profileId: string) => {
  await login();
  console.log("free follow", profileId);
  await createfreeFollow(profileId);
};
