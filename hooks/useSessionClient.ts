"use client";

import { useSession } from "next-auth/react";

export function useSessionClient() {
  const { data: session, status } = useSession();
  return { session, status };
}
