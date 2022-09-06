import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { prettyJSON } from "./helpers";

const DOES_FOLLOW = `
  query($request: DoesFollowRequest!) {
    doesFollow(request: $request) { 
			followerAddress
    	profileId
    	follows
		}
  }
`;

const doesFollowRequest = (
  followInfos: { followerAddress: string; profileId: string }[]
) => {
  return apolloClient.query({
    query: gql(DOES_FOLLOW),
    variables: {
      request: {
        followInfos,
      },
    },
  });
};

export const doesFollow = async (address: string, profileIds: string[]) => {
  const followInfos = profileIds.map((profileId) => ({
    followerAddress: address,
    profileId: profileId,
  }));

  const result = await doesFollowRequest(followInfos);
  //   prettyJSON("does follow: result", result.data);

  return result.data;
};
