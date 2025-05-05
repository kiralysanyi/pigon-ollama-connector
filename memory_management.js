import * as fs from "fs"
import { configDotenv } from "dotenv";
configDotenv();

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const memoryDir = process.env.DATA_ROOT + "/memories";

if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir)
}


const createMemory = (chatid, identifier, data) => {
    if (identifier == undefined && data == undefined) {
        return "failed to create memory"
    }
    console.log("Create memory: ", identifier, data)
    const memoryPath = memoryDir + "/" + chatid + ".json"

    if (!fs.existsSync(memoryPath)) {
        fs.writeFileSync(memoryPath, "{}")
    }

    const chatMemory = JSON.parse(fs.readFileSync(memoryPath))

    chatMemory[identifier] = data;

    fs.writeFileSync(memoryPath, JSON.stringify(chatMemory, null, 2))
    return "Memory created"
}

const rememberMemory = (chatid, identifier) => {
    console.log("Remember: ", identifier)
    const memoryPath = memoryDir + "/" + chatid + ".json"

    if (!fs.existsSync(memoryPath)) {
        return "No memories found with this person"
    }

    const chatMemory = JSON.parse(fs.readFileSync(memoryPath))

    if (chatMemory[identifier] == undefined) {
        return `No memory with identifier: ${identifier}`
    } else {
        return JSON.stringify(chatMemory[identifier])
    }
}

const rememberAll = (chatid) => {
    console.log("Remember all: ", chatid)
    const memoryPath = memoryDir + "/" + chatid + ".json"

    if (!fs.existsSync(memoryPath)) {
        return "No memories found with this person"
    }

    const chatMemory = JSON.parse(fs.readFileSync(memoryPath))
    return JSON.stringify(chatMemory);
}

export {rememberAll, rememberMemory, createMemory}
