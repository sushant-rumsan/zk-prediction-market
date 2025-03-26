import { Hasher } from "@doko-js/wasm";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const hashedValue = Hasher.hash(
        "keccak256", // algorithm
        "{arr: [1u8, 1u8], size: 2u8}", // input value
        "address", // output type
        "testnet" // or "mainnet
      );
      res.status(201).json(hashedValue);
    } catch (error) {}
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
