export const ALGORITHM = "bhp256";
export const OUTPUT_TYPE = "field";
export const NATIVE_TOKEN = "11111111111111111111field";

export const toLeoStakeRecord = (eventId: string, user: string): string => {
  return `{ account: ${user}, token_id: ${NATIVE_TOKEN}, event_id: ${eventId}field }`;
};

export const getUserStakeKey = (
  eventId: string,
  user: string,
  dokoJsWasm: any
) => {
  const message = toLeoStakeRecord(eventId, user);
  const hash = dokoJsWasm.Hasher.hash(
    ALGORITHM,
    message,
    OUTPUT_TYPE,
    "testnet"
  );
  return hash;
};
