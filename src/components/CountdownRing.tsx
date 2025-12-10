import React, { useEffect } from "react";
export default function CountdownRing({
  time,
  roomClosed,
  participants,
  currentTurn,
  userId,
  sendMessage,
}: {
  time: number;
  roomClosed: boolean;
  participants: any[];
  currentTurn: string;
  userId: string;
  sendMessage: () => void;
}) {
  const TURN_MIN = 5000;
  const TURN_VAR = 5000;
  const [timer, setTimer] = React.useState(time);

  useEffect(() => {
    if (roomClosed) return;
    if (participants.length < 2) return; // Wait for at least 2
    if (currentTurn === userId) {
      setTimer(TURN_MIN + Math.floor(Math.random() * TURN_VAR));
      const timeout = setTimeout(() => {
        sendMessage();
      }, timer);
      return () => clearTimeout(timeout);
    }
  }, [currentTurn, roomClosed, timer, userId, participants.length]);

  return (
    <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-pink-400 text-2xl font-bold">
      {Math.ceil(timer / 1000)}s
    </div>
  );
}