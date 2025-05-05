import { configDotenv } from "dotenv";
configDotenv();
import * as fs from "fs";
import { io } from "socket.io-client";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { extractInfo } from "./dataextractor.js";
import socket from "./socket.js";
import { login } from "./authHandler.js";
import * as memoryManager from "./memory_management.js"
import { genSysPrompt, genTemplate } from "./ollama.js";
import { Ollama } from 'ollama'



const server = process.env.SERVER;
const username = process.env.USRNAME;
const DATA_ROOT = process.env.DATA_ROOT;


if (fs.existsSync(DATA_ROOT + "/chats.json") == false) {
    fs.writeFileSync(DATA_ROOT + "/chats.json", "{}")
}

const chats = JSON.parse(fs.readFileSync(DATA_ROOT + "/chats.json"));

const saveMessages = () => {
    fs.writeFileSync(DATA_ROOT + "/chats.json", JSON.stringify(chats));
}


let pigonChats = [];

let syncChats = async () => {
    let res = await fetch(server + "/api/v1/chat/chats", {
        method: "GET",
        credentials: "include",
        headers: {
            Cookie: await login()
        }
    });

    console.log("Sync: ", res.status, res.statusText);

    let response = await res.json();
    if (response.success == true) {
        pigonChats = response.data;
        console.log("Chats: ", pigonChats)
    }
}

await syncChats();


let checkIfGroupChat = async (chatID) => {
    for (let i in pigonChats) {
        if (pigonChats[i].chatid == chatID) {
            if (pigonChats[i]["groupchat"] == 1) {
                return true;
            } else {
                return false;
            }
        }
    }

    await syncChats();

    for (let i in pigonChats) {
        if (pigonChats[i].chatid == chatID) {
            if (pigonChats[i]["groupchat"] == 1) {
                return true;
            } else {
                return false;
            }
        }
    }
}



const ollama = new Ollama({ host: process.env.OLLAMA_HOST })

function ollamaRequest(chatid, message, cb) {
    message = new Date().toISOString() + " " + message
    console.log("User:" + message);
    ollama.chat(chats[chatid]).then(async (res) => {
        //TODO: create a function that calls the ai to extract information about the user and return a json object to save it with the existing shitty memory management api.

        console.log(res)
        let text = res.message.content;
        let role = res.message.role;
        let formattedText = text.replace('<|start_header_id|>assistant<|end_header_id|>\n\n', '');

        chats[chatid].messages.push({
            role: role,
            content: formattedText
        });

        console.log("AI: ", text);

        cb(text);
    })
}

socket.on("message", async (data) => {

    data = JSON.parse(data);
    if (data["senderName"] == username) {
        return;
    }

    if (data["message"]["type"] != "text") {
        setTimeout(() => {
            socket.emit("message", {
                chatID: data["chatID"], message: {
                    type: "text",
                    content: "Sorry, I can't process media."
                }
            });
        }, 1000);

        return;
    }


    console.log(data);
    let isGroupChat = await checkIfGroupChat(data["chatID"]);
    if (chats[data["chatID"]] == undefined) {
        console.log(data["chatID"], isGroupChat);
        chats[data["chatID"]] = genTemplate(isGroupChat, username);
        chats[data["chatID"]].messages.push({
            role: "system",
            content: "Known info about the user: " + JSON.stringify(memoryManager.rememberAll(data["chatID"]))
        })
    }

    let prompt = data["message"]["content"];

    if (prompt == "/clearcontext") {
        for(let i in chats[data["chatID"]]["messages"]) {
            if (chats[data["chatID"]]["messages"][i].role == "system") {
                delete chats[data["chatID"]]["messages"][i];
            }
        }
        saveMessages();
        extractInfo(data["chatID"], JSON.stringify(chats[data["chatID"]].messages))
        delete chats[data["chatID"]];
        saveMessages();
        setTimeout(() => {
            socket.emit("message", {
                chatID: data["chatID"], message: {
                    type: "text",
                    content: "Context has been cleared, I have a little amnesia i guess"
                }
            });
        }, 1000);
        return;
    }



    if (isGroupChat == true) {
        prompt = `${data["senderName"]}: ${data["message"]["content"]}`
    }

    chats[data["chatID"]].messages[0]["content"] = genSysPrompt(isGroupChat, data["senderName"]);

    chats[data["chatID"]].messages.push({
        role: "user",
        content: prompt
    });
    saveMessages();

    if (data["message"]["content"].includes("@" + username) == false && isGroupChat == true) {
        return;
    }

    ollamaRequest(data["chatID"], prompt, (airesponse) => {
        socket.emit("message", {
            chatID: data["chatID"], message: {
                type: "text",
                content: airesponse
            }
        });
    })
});
