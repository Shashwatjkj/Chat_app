// Move Socket.io logic OUTSIDE of routes 

// let object_of_rooms={};

// io.on("connection", (socket) => {
//     console.log("A user connected");

//     socket.on("enterRoom", ({ username, room }) => {
//         if (Array.isArray(object_of_rooms[room])) {
//             object_of_rooms[room].push(username);
//         } else {
//             object_of_rooms[room] = [username]; // Create a new array if it doesn't exist
//         }
//         socket.join(room);
//         console.log(`${username} joined room: ${room}`);
//         io.to(room).emit("people_present",[...object_of_rooms[room]])
//     });

//     socket.on("from_client", (data) => {
//     console.log(`Message from ${data.username} in Room ${data.room}: ${data.message}`);   
//         // Broadcast message to all clients
//         io.to(data.room).emit("from_server", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });




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
        //console.log(`Message from ${data.username} in Room ${data.room}: ${data.message}`);   
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
                }

                io.to(room).emit("people_present", [...(object_of_rooms[room] || [])]);
            }

            delete userSockets[socket.id]; // Remove user from tracking
        }
    });
});
