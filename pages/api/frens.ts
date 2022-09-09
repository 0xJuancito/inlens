import type { NextApiRequest, NextApiResponse } from "next";
import { findFriends } from "who-is-in-lens";
import rateLimit from "../../utils/rate-limit";
import { getToken } from "next-auth/jwt";
import { TooManyRequestsError } from "who-is-in-lens";

const limiter = rateLimit({
  interval: 60 * 1000 * 15, // 15 minutes
  uniqueTokenPerInterval: 1, // Max 1 users per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  let accessToken: string;
  if (token?.accessToken && token?.exp) {
    const expirationDate = (token.exp as number) * 1000;
    if (Date.now() < expirationDate) {
      accessToken = token.accessToken as string;
    }
  }

  const { username: rawUsername } = req.query;

  const username =
    typeof rawUsername === "string" ? rawUsername : rawUsername[0];

  if (!username) {
    res.status(400).json({ error: "No username was provided" });
  }

  try {
    if (!accessToken) {
      await limiter.check(res, 50, "CACHE_TOKEN"); // 50 requests per 15 minutes
    }
    const frens = await findFriends(username, accessToken);
    res.status(200).json(frens);
  } catch (err) {
    if (!err || err instanceof TooManyRequestsError) {
      res.status(429).json({
        error: "Login with Twitter or try again in a few minutes ⌛️",
      });
      return;
    }

    res.status(404).json({
      error: "There are no Lens frens for that profile",
    });
  }
}
