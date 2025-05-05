import { io } from "socket.io-client";
import { login } from "./authHandler.js";

const socket = io(process.env.SERVER, {
    path: "/socketio",
    extraHeaders: {
        Cookie: await login()
    }
});

socket.on("error", (err) => {
    console.error("Socket error occurred:", err);
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message); 
});


socket.on("connect", () => {
    console.log("Connected to socketio server!");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});

//automatically decline calls
socket.on("incomingcall", ({ callid, username, chatid }) => {
    socket.emit("response" + callid, { accepted: false, reason: "Operation not supported." });
})

export default socket;