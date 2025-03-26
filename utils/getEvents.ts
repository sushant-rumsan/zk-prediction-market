"use client";

import { BLOCKCHAIN } from "@/constants/blockchain";
import axios from "axios";

export const getEvents = async (key: string, value: string) => {
  const rpcUrl = `${BLOCKCHAIN.EXPLOER_URL}/${BLOCKCHAIN.PROGRAM_ID}/${key}/${value}`;

  const data = await axios.get(rpcUrl);

  const formattedStr = data.data
    .replace(/(\w+):/g, '"$1":')
    .replace(/u64/g, "")
    .replace(/(\d+)n/g, '"$1"');

  const jsonObj = JSON.parse(formattedStr);

  return jsonObj;
};
