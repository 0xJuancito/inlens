import type { NextApiRequest, NextApiResponse } from "next";
import { findFriends } from "who-is-in-lens";
import rateLimit from "../../utils/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000 * 15, // 15 minutes
  uniqueTokenPerInterval: 1, // Max 1 users per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username: rawUsername } = req.query;

  const username =
    typeof rawUsername === "string" ? rawUsername : rawUsername[0];

  if (!username) {
    res.status(400).json({ error: "No username was provided" });
  }

  try {
    await limiter.check(res, 50, "CACHE_TOKEN"); // 50 requests per 15 minutes
    const frens = await findFriends(username);
    res.status(200).json(frens);
  } catch {
    res.status(429).json({ error: "Rate limit exceeded" });
  }
}
