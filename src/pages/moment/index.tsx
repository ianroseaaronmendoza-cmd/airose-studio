import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Gun from "gun";

const ROOM_TYPES = [
  { value: "5s", label: "5 second room" },
  // Future: { value: "whisper", label: "Whisper Room" }, ...
];

export default function MomentLobby() {
  const [rooms, setRooms] = useState<{ name: string; type: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState(ROOM_TYPES[0].value);
  const navigate = useNavigate();

  // Fetch available rooms
  useEffect(() => {
    const gun = Gun();
    const roomList = gun.get("momentRoomList");
    roomList.map().on((data, key) => {
      if (data && key) {
        setRooms(prev => {
          if (prev.find(r => r.name === key)) return prev;
          return [...prev, { name: key, type: data.type || "5s" }];
        });
      }
    });
  }, []);

  function handleCreateRoom() {
    if (!newRoomName.trim()) return;
    const gun = Gun();
    gun.get("momentRoomList").get(newRoomName.trim()).put({ type: newRoomType, created: Date.now() });
    setShowModal(false);
    setNewRoomName("");
    setNewRoomType(ROOM_TYPES[0].value);
    navigate(`/moment/${newRoomName.trim()}`);
  }

  function handleJoin(room: string) {
    navigate(`/moment/${room}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-gray-100 relative">
      {/* Create Room Button */}
      <button
        className="absolute top-6 right-6 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white font-semibold"
        onClick={() => setShowModal(true)}
      >
        Create Room
      </button>

      <h1 className="text-3xl font-bold mb-6 text-pink-400">Keep the Moment Alive</h1>
      <div className="w-full max-w-sm bg-neutral-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Available Rooms</h2>
        {rooms.length === 0 ? (
          <div className="text-gray-500">No rooms yet.</div>
        ) : (
          <ul>
            {rooms.map(room => (
              <li key={room.name} className="mb-2 flex items-center justify-between">
                <span>{room.name} <span className="text-xs text-gray-400">({ROOM_TYPES.find(t => t.value === room.type)?.label})</span></span>
                <button
                  onClick={() => handleJoin(room.name)}
                  className="ml-2 px-3 py-1 bg-neutral-800 hover:bg-pink-600 rounded text-gray-200 hover:text-white transition"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for creating a room */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-8 shadow-xl w-full max-w-xs">
            <h2 className="text-xl font-semibold mb-4 text-pink-400">Create Room</h2>
            <input
              type="text"
              placeholder="Room name"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-neutral-800 text-gray-200 mb-4"
            />
            <select
              value={newRoomType}
              onChange={e => setNewRoomType(e.target.value)}
              className="w-full px-4 py-2 rounded bg-neutral-800 text-gray-200 mb-4"
            >
              {ROOM_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white font-semibold transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-800 rounded text-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}