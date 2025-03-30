import { Router } from "express";
import { array_of_rooms } from "../likedb.js";
const router = Router();


router.post("/create-room", (req, res) => {
    let { name, room } = req.body;
    
    if (!name || !room) {
        return res.status(400).json({ message: "Name and room code are required!" });
    }

    room = String(room);  // Ensure room is always a string

    if (array_of_rooms.includes(room)) {
        return res.status(400).json({ message: "Room name already exists" });
    }

    array_of_rooms.push(room);
    console.log(`${name} created the room: ${room}`);

    res.json({
        message: `Room ${room} created by ${name}`,
        redirect: `/room-created?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`,
    });
});

router.post("/join-room", (req, res) => {
    let { name, room } = req.body;
    
    if (!name || !room) {
        return res.status(400).json({ message: "Name and room code are required!" });
    }

    room = String(room);  // Ensure room is always a string

    if (!array_of_rooms.includes(room)) {
        return res.status(400).json({ message: "Room name does not exist" });
    }

    console.log(`${name} joined the room: ${room}`);

    res.json({
        message: `Room ${room} joined by ${name}`,
        redirect: `/room-joined?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`,
    });
});



export default router;