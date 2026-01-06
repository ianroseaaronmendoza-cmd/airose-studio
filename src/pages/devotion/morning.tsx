import DevotionReader from "@/components/DevotionReader";
import { useDevotion } from "../../hooks/useDevotion";

export default function MorningDevotionPage() {
  const { data, isLoading, error } = useDevotion("am");

  if (isLoading) {
    return (
      <div className="text-center mt-20 text-neutral-400">
        Loading morning devotion…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center mt-20 text-red-400">
        Failed to load morning devotion.
      </div>
    );
  }

  return <DevotionReader title="Morning Devotion" data={data} />;
}
