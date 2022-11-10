import { profiles } from "../lib/get-profiles";
import { doesFollow } from "../lib/does-follow";
import { sortFrens } from "./frens";

type ApiFren = {
  twitter: {
    handle: string;
    name: string;
    description: string | null;
    avatar: string | null;
  };
  lens: {
    handle: string;
  };
  ensName: string | null;
};

export type Fren = {
  twitter: {
    handle: string;
    name: string;
    description: string | null;
    avatar: string | null;
  };
  lens: {
    handle: string;
    follows?: boolean;
    id?: string;
  };
  ensName: string | null;
};

export class TooManyRequestsError extends Error {}
export class NoFollowingError extends Error {}
export class AuthorizationError extends Error {}

const CHUNK_SIZE = 50;

export const modifyFollows = async (
  address: string,
  newFrens: Fren[]
): Promise<any> => {
  let followsArray = [];
  const flatProfilesChunks = sliceIntoChunks(newFrens, CHUNK_SIZE);
  const followPromises = flatProfilesChunks.map((chunk) =>
    doesFollow(
      address,
      chunk.map((item) => item.lens.id)
    )
  );
  const doesFollowResult = await Promise.all(followPromises);
  followsArray = doesFollowResult.flatMap((array) => array.doesFollow);

  // Add Lens follow data to the new frens
  newFrens.forEach((fren) => {
    const lensFren = followsArray.find(
      (follows) => follows.profileId.toLowerCase() === fren.lens.id
    );
    fren.lens.follows = lensFren?.follows;
  });
};

export const findFrens = async (
  twitterHandle: string,
  address?: string
): Promise<Fren[]> => {
  const res = await fetch(`/api/frens?username=${twitterHandle}`);

  if (res.status === 429) {
    throw new TooManyRequestsError();
  } else if (res.status === 401) {
    throw new AuthorizationError();
  } else if (res.status !== 200) {
    throw new NoFollowingError();
  }

  const apiFrens: ApiFren[] = await res.json();

  // Filter lens users. The API only supports names between 5 and 31 characters (+ 5 for the .lens)
  const filteredFrens = apiFrens.filter(
    (fren) => fren.lens.handle.length >= 10 && fren.lens.handle.length <= 36
  );
  const handleIds = filteredFrens.map((fren) => fren.lens.handle.toLowerCase());

  let newFrens: Fren[] = filteredFrens.map((fren) => ({
    twitter: {
      handle: fren.twitter.handle,
      name: fren.twitter.name,
      description: fren.twitter.description,
      avatar: fren.twitter.avatar,
    },
    lens: {
      handle: fren.lens.handle.toLowerCase(),
    },
    ensName: fren.ensName,
  }));

  // First get Lens profile
  const lensIdsChunks = sliceIntoChunks(handleIds, CHUNK_SIZE);
  const profilesPromises = lensIdsChunks.map((chunk) =>
    profiles({ handles: chunk })
  );
  const profilesReponse = await Promise.all(profilesPromises);
  const lensProfiles = profilesReponse.flatMap(
    (handle) => handle.profiles.items
  );

  // Add Lens profile data to the new frens
  newFrens.forEach((fren) => {
    const lensFren = lensProfiles.find(
      (lensProfile) => lensProfile.handle.toLowerCase() === fren.lens.handle
    );
    fren.lens.id = lensFren?.id.toLowerCase();
  });

  newFrens = newFrens.filter((fren) => fren.lens.id);

  // Then find if the user is following them
  if (address) {
    await modifyFollows(address, newFrens);
  }

  const allFrens = newFrens.filter((fren) => fren.lens.id);

  return sortFrens(allFrens);
};

const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};
