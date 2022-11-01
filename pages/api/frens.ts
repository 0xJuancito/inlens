import type { NextApiRequest, NextApiResponse } from "next";
import { findFriends } from "who-is-in-lens";
import rateLimit from "../../utils/rate-limit";
import { getToken } from "next-auth/jwt";
import { TooManyRequestsError } from "who-is-in-lens";
import Cache from "lru-cache";

const responseCache = new Cache({
  max: 100,
  ttl: 1000 * 60 * 60, // 1hour
});

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

  const cacheKey = `twitter-${username}`;
  if (responseCache.has(cacheKey)) {
    try {
      res.setHeader("x-cache", "HIT");
      const response = JSON.parse(responseCache.get(cacheKey));
      res.status(200).json(response as any);
      return;
    } catch (err) {}
  }

  try {
    if (!accessToken) {
      await limiter.check(res, 50, "CACHE_TOKEN"); // 50 requests per 15 minutes
    }
    const frens = await findFriends(username, accessToken);
    if (frens.length) {
      responseCache.set(cacheKey, JSON.stringify(frens));
    }
    res.status(200).json(frens);
  } catch (err) {
    if (!err || err instanceof TooManyRequestsError) {
      res.status(429).json({
        error: "Connect Twitter or try again in a few minutes ⌛️",
      });
      return;
    }

    if (err.code === 401) {
      res.status(401).json({
        error: "Authorization error",
      });
      return;
    }

    res.status(404).json({
      error: "There are no Lens frens for that profile",
    });
  }
}
