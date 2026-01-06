import DevotionReader from "../../components/DevotionReader";
import { useDevotion } from "../../hooks/useDevotion";

export default function EveningDevotionPage() {
  const { data, isLoading, error } = useDevotion("pm");

  if (isLoading) {
    return (
      <div className="text-center mt-20 text-neutral-400">
        Loading evening devotion…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center mt-20 text-red-400">
        Failed to load evening devotion.
      </div>
    );
  }

  return <DevotionReader title="Evening Devotion" data={data} />;
}
