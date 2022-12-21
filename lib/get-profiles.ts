import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { login } from "./login";
import { getAddressFromSigner } from "./ethers.service";
import { prettyJSON } from "./helpers";

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
      }
    }
  }
`;

export interface ProfilesRequest {
  profileIds?: string[];
  ownedBy?: string;
  handles?: string[];
  whoMirroredPublicationId?: string;
}

const getProfilesRequest = (request: ProfilesRequest) => {
  return apolloClient.query({
    query: gql(GET_PROFILES),
    variables: {
      request,
    },
  });
};

export const profiles = async (request?: ProfilesRequest) => {
  const address = getAddressFromSigner();

  await login(address);

  if (!request) {
    request = { ownedBy: address };
  }

  // only showing one example to query but you can see from request
  // above you can query many
  const profilesFromProfileIds = await getProfilesRequest(request);

  //   prettyJSON("profiles: result", profilesFromProfileIds.data);

  return profilesFromProfileIds.data;
};
