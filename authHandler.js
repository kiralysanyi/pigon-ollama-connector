import { configDotenv } from "dotenv";
configDotenv();

const server = process.env.SERVER;
const username = process.env.USRNAME;
const password = process.env.PASSWORD;
const devicename = process.env.DEVICENAME;
const DATA_ROOT = process.env.DATA_ROOT;


import * as fs from "fs";

function saveCookie(cookie) {
    console.log(cookie)
    return fs.writeFileSync(`${DATA_ROOT}/cookie`, JSON.stringify(cookie))
}

function getCookie() {
    if (fs.existsSync(`${DATA_ROOT}/cookie`)) {
        return JSON.parse(fs.readFileSync(`${DATA_ROOT}/cookie`))
    } else {
        return null;
    }
}

/**
 * 
 * @returns returns cookie header for further requests
 */
async function login() {

    let cookies = getCookie();

    if (cookies != null) {
        return cookies
    }

    console.log("Logging in to service...");
    let res = await fetch(server + "/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password,
            deviceName: devicename
        })
    })

    
    let response = await res.json();
    cookies = res.headers.getSetCookie();
    console.log(response);
    if (response.success == false) {
        console.error(response.data.message);
        process.exit();
    }

    saveCookie(cookies)

    return cookies;
}

export {login}