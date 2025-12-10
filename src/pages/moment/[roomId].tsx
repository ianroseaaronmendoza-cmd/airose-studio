import React from "react";
import { useParams } from "react-router-dom";
import MomentRoom from "../../components/MomentRoom";

export default function MomentRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  if (!roomId) return <div className="text-center mt-20 text-gray-400">Invalid room.</div>;
  return <MomentRoom roomId={roomId} />;
}