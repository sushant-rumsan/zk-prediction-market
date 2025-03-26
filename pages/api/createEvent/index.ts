import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      res.status(200).json("posts");
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default handler;
