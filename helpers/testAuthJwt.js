import env from "../utils/validateENV";
import {expressjwt} from "express-jwt";
import  {verificationProcess} from "./apiAuthJwt";

function testJwt() {
    const secret = process.env.API_TEST_SECRET;
    // console.log(secret);
    return expressjwt({
        secret: secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked,
    }).unless({
        // paths that can be accessed without verification
        path: [],
    });
}

async function isRevoked(req, payload) {


    return await verificationProcess(req, payload, process.env.API_TEST_SECRET);
}

export  default testJwt;