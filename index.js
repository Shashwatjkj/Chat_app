import 'dotenv/config'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import rout from './router/create.routes.js';
import  {array_of_rooms} from './likedb.js'



let port = process.env.PORT || 3000; // Use environment variable or default to 3000
const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses form data

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/", (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.redirect("/"); // Redirect back if name is empty
    }
    res.redirect(`/room?name=${encodeURIComponent(name)}`);
});

app.get("/room", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/room.html"));
});


app.use(rout)

app.get("/room-created", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/chatroom.html"));
});

app.get("/room-joined", (req, res) => {
    const { name, room } = req.query;
    res.sendFile(path.join(__dirname, "/public/chatroom.html"));
});


let object_of_rooms = {}; // Stores room data
let userSockets = {}; // Stores user details with socket ID

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("enterRoom", ({ username, room }) => {
        if (Array.isArray(object_of_rooms[room])) {
            object_of_rooms[room].push(username);
        } else {
            object_of_rooms[room] = [username]; // Create new room if not exists
        }

        // Store user details
        userSockets[socket.id] = { username, room };

        socket.join(room);
        console.log(`${username} joined room: ${room}`);

        io.to(room).emit("people_present", [...object_of_rooms[room]]);
    });

        socket.on("from_client", (data) => {
        console.log(`Message from ${data.username} in Room ${data.room}: ${data.message}`);   
        // Broadcast message to all clients
        io.to(data.room).emit("from_server", data);
    });


    socket.on("disconnect", () => {
        console.log("User disconnected");

        //Retrieve user data
        const userData = userSockets[socket.id];

        if (userData) {
            const { username, room } = userData;

            if (Array.isArray(object_of_rooms[room])) {
                object_of_rooms[room] = object_of_rooms[room].filter(user => user !== username);

                if (object_of_rooms[room].length === 0) {
                    delete object_of_rooms[room]; // Delete room if empty
                    
                    let index = array_of_rooms.indexOf(room);
                    
                    if (index !== -1) {
                        array_of_rooms.splice(index, 1); // Remove 1 element at index
                    }
                }

                io.to(room).emit("people_present", [...(object_of_rooms[room] || [])]);
            }

            delete userSockets[socket.id]; // Remove user from tracking
        }
    });
});




// 🛠 FIXED: Use `server.listen()` instead of `app.listen()`
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});












