import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Ollama } from 'ollama'

import { configDotenv } from "dotenv";
configDotenv();

const ollama = new Ollama({ host:  process.env.OLLAMA_HOST})

import * as memoryManager from "./memory_management.js"

let template = {
    "model": "gemma3:4b", //insert any models from Ollama that are on your local machine
    "messages": [
        {
            "role": "system", //"system" is a prompt to define how the model should act.
            "content": "You are an AI. Your job is to extract user preferences, information from conversations. Your answer should only be the short analyzation, only include info about the user. Do not request more info about the conversation, only reply with the requested data."
        }
    ],
    "stream": false //returns as a full message rather than a streamed response
}

const extractInfo = async (chatid, conversationSnippet) => {
    let chat = template;
    chat.messages.push({
        "role": "user",
        "content": "Extract the user's preferences mentioned in the conversation. Focus on their likes, dislikes, personal information and any specific requests. \nSnippet: \n" + conversationSnippet
    })
    let res = await ollama.chat(chat)
    console.log(res)
    let text = res.message.content;
    console.log("Data extractor: ", text);
    memoryManager.createMemory(chatid, new Date().toISOString(), text)
    return;
}

export {extractInfo}
