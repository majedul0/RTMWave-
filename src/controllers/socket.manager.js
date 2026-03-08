import { Server, Socket } from "socket.io";

let connsections = {}
let messages = {}
let timeonline={}

export const connactToSocket=(Server)=>
{
    const io = new Server(Server);

    io.on("connection", (socket) => {
        socket.on("join", (path) => {
            if (connsections[path]) {
                connsections[path].push(socket.id)
            } else {
                connsections[path] = [socket.id]
            }
            timeonline[socket.id]=Date.now()
        });

        socket.on("message", (data) => {
            if (messages[data.path]) {
                messages[data.path].push(data.message)
            } else {
                messages[data.path] = [data.message]
            }
            io.to(socket.id).emit("message", data.message);
        });

        socket.on("disconnect", () => {
            for (const path in connsections) {
                const index = connsections[path].indexOf(socket.id);
                if (index !== -1) {
                    connsections[path].splice(index, 1);
                    break;
                }
            }
            delete timeonline[socket.id]
        });
    });
}



