import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { getAddressFromSigner } from "./ethers.service";
import { prettyJSON } from "./helpers";

const GET_DEFAULT_PROFILES = `
  query($request: DefaultProfileRequest!) {
    defaultProfile(request: $request) {
      id
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
`;

const getDefaultProfileRequest = (ethereumAddress: string) => {
  return apolloClient.query({
    query: gql(GET_DEFAULT_PROFILES),
    variables: {
      request: {
        ethereumAddress,
      },
    },
  });
};

export const getDefaultProfile = async () => {
  const address = getAddressFromSigner();
  console.log("get default profile: address", address);

  const result = await getDefaultProfileRequest(address);

  return result.data;
};
