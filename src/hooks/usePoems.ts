// src/hooks/usePoems.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Poem {
  id: string;
  title: string;
  content: string;
  date: string;
}

// ✅ Fetch poems via your API route
const fetchPoems = async (): Promise<Poem[]> => {
  const res = await fetch("/api/writings/poems");
  if (!res.ok) throw new Error("Failed to load poems");
  return res.json();
};

// ✅ Save poems via your save endpoint
const savePoems = async (poems: Poem[]): Promise<void> => {
  const res = await fetch("/api/writings/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(poems),
  });
  if (!res.ok) throw new Error("Failed to save poems");
};

export function usePoems() {
  const queryClient = useQueryClient();

  const poemsQuery = useQuery<Poem[]>({
    queryKey: ["poems"],
    queryFn: fetchPoems,
  });

  const savePoemsMutation = useMutation({
    mutationFn: async (updatedPoems: Poem[]) => {
      await savePoems(updatedPoems);
    },
    onSuccess: () => {
      // ✅ Immediately refresh list
      queryClient.invalidateQueries({ queryKey: ["poems"] });
    },
  });

  return {
    poems: poemsQuery.data || [],
    isLoading: poemsQuery.isLoading,
    error: poemsQuery.error,
    savePoems: savePoemsMutation.mutate,
  };
}
