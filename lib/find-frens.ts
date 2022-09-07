import { profiles } from "../lib/get-profiles";
import { doesFollow } from "../lib/does-follow";

export type Fren = {
  twitter: {
    handle: string;
  };
  lens: {
    handle: string;
    follows?: boolean;
    id?: string;
  };
};

export class TooManyRequestsError extends Error {}

export const findFrens = async (
  twitterHandle: string,
  address?: string
): Promise<Fren[]> => {
  const CHUNK_SIZE = 50;

  const res = await fetch(`/api/frens?username=${twitterHandle}`);

  if (res.status === 200) {
    const apiFrens = await res.json();

    // Filter lens users. The API only supports names between 5 and 31 characters (+ 5 for the .lens)
    const filteredFrens = apiFrens.filter(
      (fren) => fren.lens.length >= 10 && fren.lens.length <= 36
    );
    const handleIds = filteredFrens.map((fren) => fren.lens.toLowerCase());

    const newFrens: Fren[] = filteredFrens.map((fren) => ({
      twitter: {
        handle: fren.twitter,
      },
      lens: {
        handle: fren.lens.toLowerCase(),
      },
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
    console.log(lensProfiles);

    // Add Lens profile data to the new frens
    newFrens.forEach((fren) => {
      const lensFren = lensProfiles.find(
        (lensProfile) => lensProfile.handle.toLowerCase() === fren.lens.handle
      );
      fren.lens.id = lensFren?.id.toLowerCase();
    });

    // Then find if the user is following them
    let followsArray = [];
    if (address) {
      const flatProfilesChunks = sliceIntoChunks(lensProfiles, CHUNK_SIZE);
      const followPromises = flatProfilesChunks.map((chunk) =>
        doesFollow(
          address,
          chunk.map((item) => item.id)
        )
      );
      const doesFollowResult = await Promise.all(followPromises);
      followsArray = doesFollowResult.flatMap((array) => array.doesFollow);
      console.log(followsArray);

      // Add Lens follow data to the new frens
      newFrens.forEach((fren) => {
        const lensFren = followsArray.find(
          (follows) => follows.profileId.toLowerCase() === fren.lens.id
        );
        fren.lens.follows = lensFren?.follows;
      });
    }

    const sortAlphabetically = (a, b) =>
      a.twitter.handle.localeCompare(b.twitter.handle);

    const allFrens = newFrens.filter((fren) => fren.lens.id);
    const followingFrens = allFrens
      .filter((fren) => fren.lens.follows)
      .sort(sortAlphabetically);
    const notFollowingFrens = allFrens
      .filter((fren) => !fren.lens.follows)
      .sort(sortAlphabetically);

    return notFollowingFrens.concat(followingFrens);
  } else {
    throw new TooManyRequestsError(
      "Too many requests. Please try again in a few minutes ⌛️"
    );
  }
};

const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};
