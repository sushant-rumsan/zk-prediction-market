export const safeRes = (res: any) => {
  return res.map((item: any) => {
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        typeof value === "bigint" ? value.toString() : value,
      ])
    );
  });
};
