import React, { useEffect, useState, useRef } from "react";
import Gun from "gun";
import { v4 as uuidv4 } from "uuid";
import CountdownRing from "./CountdownRing";
import MessageFade from "./MessageFade";

const TURN_MIN = 4000;
const TURN_VAR = 2000;

function randomUsername() {
  const animals = ["Fox", "Cat", "Wolf", "Bear", "Owl", "Deer", "Hawk", "Swan", "Otter", "Lynx"];
  const colors = ["Red", "Blue", "Green", "Pink", "Gold", "Silver", "Violet", "Indigo", "Amber", "Ivory"];
  return (
    colors[Math.floor(Math.random() * colors.length)] +
    animals[Math.floor(Math.random() * animals.length)] +
    Math.floor(100 + Math.random() * 900)
  );
}

export default function MomentRoom({ roomId }: { roomId: string }) {
  const gun = useRef<any>(null);
  const [userId] = useState(() => uuidv4());
  const [username] = useState(() => randomUsername());
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [timer, setTimer] = useState(TURN_MIN);
  const [roomClosed, setRoomClosed] = useState(false);
  const [streak, setStreak] = useState(0);

  // Setup Gun
  useEffect(() => {
    gun.current = Gun();
    const room = gun.current.get("momentRoom").get(roomId);

    // Register user
    room.get("participants").set(userId);

    // Listen for participants
    room.get("participants").map().on((id: string) => {
      setParticipants(prev => prev.includes(id) ? prev : [...prev, id]);
    });

    // Listen for current turn
    room.get("currentTurn").on((turn: string) => setCurrentTurn(turn));

    // Listen for messages
    room.get("messages").map().on((msg: any) => {
      if (msg && msg.text) setMessages(prev => [...prev, msg]);
    });

    // Listen for room closed
    room.get("roomClosed").on((closed: boolean) => setRoomClosed(!!closed));

    // Listen for streak
    room.get("streak").on((val: number) => setStreak(val));

    return () => {
      room.get("participants").unset(userId);
    };
  }, [roomId, userId]);

  // Timer logic (simplified MVP)
  useEffect(() => {
    if (roomClosed) return;
    if (currentTurn === userId) {
      setTimer(TURN_MIN + Math.floor(Math.random() * TURN_VAR));
      const timeout = setTimeout(() => {
        sendMessage();
      }, timer);
      return () => clearTimeout(timeout);
    }
  }, [currentTurn, roomClosed, timer, userId]);

  function sendMessage() {
    if (!message.trim()) return;
    gun.current.get("momentRoom").get(roomId).get("messages").set({
      text: message,
      user: userId,
      ts: Date.now(),
    });
    setMessage("");
  }

  if (roomClosed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-gray-100">
        <h2 className="text-2xl mb-4">🕯️ The moment has passed.</h2>
        <p className="mb-2">⏱️ It lived for {Math.floor(streak / 60)}m {streak % 60}s.</p>
        <button
          className="mt-6 px-6 py-2 bg-pink-600 rounded text-white"
          onClick={() => window.location.href = "/moment"}
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-pink-400">Room: {roomId}</h1>
      <CountdownRing
        time={timer}
        roomClosed={roomClosed}
        participants={participants}
        currentTurn={currentTurn ?? ""}
        userId={userId}
        sendMessage={sendMessage}
      />
      <div className="mt-6 mb-4">
        {messages.slice(-5).map((msg, i) => (
          <MessageFade key={i} text={msg.text} user={msg.user} />
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={currentTurn !== userId}
        className="w-full max-w-xs px-4 py-2 rounded bg-neutral-800 text-gray-200"
        placeholder={currentTurn === userId ? "Type your message..." : "Wait for your turn..."}
      />
      <div className="mt-4 text-sm text-gray-400">
        Participants: {participants.length}
      </div>
      {participants.length < 2 && (
        <div className="mt-4 text-pink-400">Waiting for another participant to join…</div>
      )}
    </div>
  );
}