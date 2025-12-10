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
    room.get("participants").get(userId).put({ userId, username, joined: Date.now() });

    const removeSelf = () => {
      room.get("participants").get(userId).put(null);

      // After a short delay, check if anyone is left
      setTimeout(() => {
        room.get("participants").once((data: any) => {
          const stillThere = Object.values(data || {}).filter((p: any) => p && p.userId).length;
          if (!stillThere) {
            // Clear room data
            room.get("messages").put(null);
            room.get("currentTurn").put(null);
            room.get("roomClosed").put(null);
            room.get("streak").put(null);
          }
        });
      }, 500);
    };

    window.addEventListener("beforeunload", removeSelf);
    return () => {
      removeSelf();
      window.removeEventListener("beforeunload", removeSelf);
    };
  }, [roomId, userId, username]);

  // Participants logic
  useEffect(() => {
    const room = gun.current.get("momentRoom").get(roomId);
    room.get("participants").map().on((data: any) => {
      setParticipants(prev => {
        // Remove nulls and deduplicate by userId
        const filtered = prev.filter(p => p && p.userId !== data?.userId);
        if (data && data.userId) {
          return [...filtered, data];
        }
        return filtered;
      });
    });
  }, [roomId]);

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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-gray-100">
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
        Participants: {participants.length}{" "}
        {participants.map(p => p.username).join(", ")}
      </div>
      {participants.length < 2 && (
        <div className="mt-4 text-pink-400">Waiting for another participant to join…</div>
      )}
      <button
        className="absolute top-6 right-6 px-4 py-2 bg-neutral-800 hover:bg-pink-600 rounded text-gray-200 hover:text-white transition"
        onClick={() => {
          const room = gun.current.get("momentRoom").get(roomId);
          room.get("participants").get(userId).put(null);
          window.location.href = "/moment";
        }}
      >
        Leave Room
      </button>
    </div>
  );
}