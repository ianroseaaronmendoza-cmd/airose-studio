import { useQuery } from "@tanstack/react-query";
import { InvalidDevotionError, parseDevotion } from "../lib/devotionData";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbyMoxiOzv8O0DY8zF92Q-q0VRFpCB_yMqzbL8Sb0S_C8rxYIdduxpzHQxOMgykWY5aa/exec";

export function useDevotion(period: "am" | "pm") {
  return useQuery({
    queryKey: ["devotion", period],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}?period=${period}`);
      if (!res.ok) throw new Error("Failed to load devotion");
      return parseDevotion(await res.json());
    },
    retry: (failureCount, error) =>
      !(error instanceof InvalidDevotionError) && failureCount < 3,
    refetchOnWindowFocus: false
  });
}
