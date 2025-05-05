import { configDotenv } from "dotenv";
import { genDatePrompt } from "./extra.js";
configDotenv();


let genSysPrompt = (isGroupChat, partnername) => {
    let whoami = `You're ${process.env.USRNAME}. ${process.env.SYSPROMPT}`
    let promptlimit = " Keep your responses short. Your responses should be less than 50 words.";
    let currentTime = genDatePrompt();

    let sysprompt;
    if (isGroupChat == true) {
        sysprompt = whoami + "You are in a group chat with multiple participants." + promptlimit + currentTime
    } else {
        sysprompt = whoami + `You are having a conversation with ${partnername}.` + promptlimit + currentTime;
    }

    return sysprompt;
}

let genTemplate = (isGroupChat, partnername) => {

    let template = {
        "model": "gemma3:4b", //insert any models from Ollama that are on your local machine
        "messages": [
            {
                "role": "system", //"system" is a prompt to define how the model should act.
                "content": genSysPrompt(isGroupChat, partnername)
            }
        ],
        //tools: tools,
        "stream": false //returns as a full message rather than a streamed response
    }

    return template;
}

export { genTemplate, genSysPrompt }