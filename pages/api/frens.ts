import type { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../utils/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 1, // Max 1 users per second
});

const frens = [
  {
    twitter: "StaniKulechov",
    lens: "stani.lens",
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "No username was provided" });
  }

  try {
    await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per minute
    res.status(200).json(frens);
  } catch {
    res.status(429).json({ error: "Rate limit exceeded" });
  }
}
