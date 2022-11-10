import { Fren } from "./find-frens";

export const sortFrens = (frens: Fren[]): Fren[] => {
  const auxFrens = [...frens];

  const sortAlphabetically = (a, b) =>
    a.twitter.handle.localeCompare(b.twitter.handle);

  const followingFrens = auxFrens
    .filter((fren) => fren.lens.follows)
    .sort(sortAlphabetically);
  const notFollowingFrens = auxFrens
    .filter((fren) => !fren.lens.follows)
    .sort(sortAlphabetically);

  return notFollowingFrens.concat(followingFrens);
};
