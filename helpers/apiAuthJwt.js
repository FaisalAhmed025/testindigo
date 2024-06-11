/*
import {expressjwt} from "express-jwt";
import JWT from "jsonwebtoken";
import ErrorResponse from "../errorHandler/errorResponse";

import pool from "../database/db";
import env from "../utils/validateENV";
import {Constants, Tables} from "./constant";
import jwt from "jsonwebtoken";

export async function getUserById(id, table = Tables.AGENT) {
    // console.log(id)

    try {
        // Acquire a connection from the pool

        const selectQuery = `
            SELECT *
            FROM ${table}
            WHERE id = ?
        `;

        // Execute the query
        const [user] = await pool.query(selectQuery, [id]);

        // Return the result
        return user;
    } catch (error) {
        // Handle the error
        console.error("Error in getUserById:", error);
        throw error; // Re-throw the error to propagate it up
    }
}

// function that allows only logged-in users to access the application
function apiJwt() {
    const secret = process.env.API_TOKEN_SECRET;
    // console.log(secret);

   //console.log('check time')
    return expressjwt({
        secret: secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked,
    }).unless({
        // paths that can be accessed without verification
        path: [
            { url: /\/api_agent\/get_access_token(.*)/, methods: ["GET"] },
            { url: /\/api_agent\/get_test_access_token(.*)/, methods: ["GET"] }
        ],
    });
}

export async function verificationProcess(req, payload, secret) {
    try {

        //console.log('now')


        const authorizationHeader = req.headers["authorization"];


        if (!authorizationHeader) {
            console.error("Authorization header missing");
            return true;
        }

        const token = authorizationHeader.split(" ")[1];
        if (!token) return true

        // Additional check for token verification success
        const isTokenValid = await verifyToken(token,  secret);
        if (!isTokenValid) {
            console.error("Token verification failed");
            return true; // Revoke token on verification failure
        }


        let user;
        try {
            user = await getUserById(payload.payload.id);
        } catch (getUserError) {
            console.error("Error in getUserById:", getUserError);
            return true; // Revoke token on error
        }

        if (!user) {
            console.error("User not found");
            return true;
        }

       /// console.log('now')
        req.user = user[0] ;

        //console.log(req.user)

     //   console.log({status: req.user.status })

        // Perform checks here based on user.status
        return !(req.user?.status === "approved");
    } catch (error) {
        console.error("Error in isRevoked:", error);
        return true; // Revoke token on any error
    }
}

   async function isRevoked(req, payload) {
    //console.log('revoke')
    return await verificationProcess(req, payload, process.env.API_TOKEN_SECRET);
}

export async function verifyToken(token,  secret) {
    try {
      //  console.log('there a')

        return await jwt.verify(token,  secret);
    } catch (error) {
        // Handle verification failure, e.g., token has expired or is invalid
        console.error('Error verifying token:', error);
        throw error; // You may choose to handle the error differently based on your requirements
    }
}


export  default apiJwt;
*/
