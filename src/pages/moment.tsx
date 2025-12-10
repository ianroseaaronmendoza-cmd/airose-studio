import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Gun from "gun";

const TURN_MIN = 4000; // 4s
const TURN_RANGE = 2000; // +0–2s random

export default function MomentRoom() {
  const gun = useRef<any>(null);
  if (!gun.current) {
    gun.current = Gun({ peers: ["https://gun-manhattan.herokuapp.com/gun"] });
  }
  const room = gun.current.get("momentRoom");
  const [userId] = useState(() => uuidv4().slice(0, 5));
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [participants, setParticipants] = useState<string[]>([]);
  const [streakStart, setStreakStart] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [roomClosed, setRoomClosed] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [typingPattern, setTypingPattern] = useState<number[]>([]);

  // Removed duplicate and incorrect declaration of 'room'

  // join room
  useEffect(() => {
    room.get("participants").get(userId).put(true);
    room.get("participants").map().on((v: boolean, id: string) => {
      if (v) setParticipants((p) => Array.from(new Set([...p, id])));
    });
    return () => room.get("participants").get(userId).put(null);
  }, []);

  // listen for messages
  useEffect(() => {
    room.get("message").on((data: { text?: string; sender?: string } | undefined) => {
      if (data?.text) {
        setMessage(data.text);
        setTimer(0);
        setStreakStart((s) => s ?? Date.now());
      }
    });
  }, []);

  // listen for turn updates
  useEffect(() => {
    room.get("currentTurn").on((t: number) => {
      setTurnIndex(t || 0);
      setIsMyTurn(participants[t % participants.length] === userId);
    });
  }, [participants]);

  // handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setTypingPattern((t) => [...t, Date.now()]);
  };

  // detect human typing
  const isHumanTyping = () => {
    if (typingPattern.length < 2) return false;
    const diffs = typingPattern.slice(1).map((t, i) => t - typingPattern[i]);
    const variance = Math.max(...diffs) - Math.min(...diffs);
    return variance > 50;
  };

  // main turn timer
  useEffect(() => {
    if (!isMyTurn || roomClosed) return;
    const duration = TURN_MIN + Math.random() * TURN_RANGE;
    setTimer(duration / 1000);
    const tick = setInterval(() => setTimer((t) => Math.max(0, t - 0.1)), 100);
    const timeout = setTimeout(() => {
      const human = isHumanTyping();
      if (text && human) {
        room.get("message").put({ sender: userId, text });
        room.get("lastActive").put(Date.now());
      }
      setText("");
      setTypingPattern([]);
      room.get("currentTurn").put((turnIndex + 1) % (participants.length || 1));
    }, duration);
    return () => {
      clearTimeout(timeout);
      clearInterval(tick);
    };
  }, [isMyTurn, turnIndex, participants, text]);

  // inactivity / room close detection
  useEffect(() => {
    const check = setInterval(() => {
      room.get("lastActive").once((last: any) => {
        if (!last || Date.now() - last > (participants.length || 1) * 7000) {
          if (streakStart) setStreak(Math.floor((Date.now() - streakStart) / 60000));
          room.get("closed").put(true);
        }
      });
    }, 5000);
    return () => clearInterval(check);
  }, [participants, streakStart]);

  // listen for close signal
  useEffect(() => {
    room.get("closed").on((v: boolean) => v && setRoomClosed(true));
  }, []);

  if (roomClosed)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-white bg-black">
        <h1 className="text-2xl mb-2">🕯️ The moment has passed.</h1>
        <p className="text-sm mb-1">⏱️ It lived for {streak} minute{streak === 1 ? "" : "s"}.</p>
        <a href="/" className="text-pink-400 hover:underline">
          Return Home
        </a>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4">
      <h1 className="text-2xl mb-2 font-light">Keep the Moment Alive</h1>
      <p className="text-sm mb-6 text-gray-400">
        Say something before time runs out. The room dies if silence wins.
      </p>

      <div className="text-lg mb-4 min-h-[2rem] transition-opacity duration-500">
        {message && <span className="opacity-80">{message}</span>}
      </div>

      <input
        type="text"
        value={text}
        onChange={handleTyping}
        disabled={!isMyTurn}
        className={`rounded-lg px-4 py-2 text-black w-64 text-center ${
          isMyTurn ? "" : "opacity-50"
        }`}
        placeholder={isMyTurn ? "Type..." : "Wait for your turn..."}
      />

      <div className="text-xs text-gray-500 mt-3">
        {isMyTurn ? `Your turn — ${timer.toFixed(1)}s` : "Waiting..."}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        Room: 1 | Participants: {participants.length}
      </div>
    </div>
  );
}
