import { expressjwt } from "express-jwt";
import JWT from "jsonwebtoken";
import ErrorResponse from "../errorHandler/errorResponse";

import pool from "../database/db";
import env from "../utils/validateENV";
import { Constants, Tables } from "./constant";
import jwt from "jsonwebtoken";
import { verificationProcess } from "./apiAuthJwt";

// function that allows only logged-in users to access the application
function authJwt(version) {
  const secret = env.JWT_SECRET;
  // console.log(version);
  return expressjwt({
    secret: secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    // paths that can be accessed without verification
    path: [
      {
        url: new RegExp(`/api/${version}/agent/create_agent(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/create-account-with-phone(.*)`),
        methods: ["POST", "PATCH"],
      },
      {
        url: new RegExp(`/api/${version}/agent/create-account(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/auth/login(.*)`),
        methods: ["POST", "PATCH"],
      },
      {
        url: new RegExp(`/api/${version}/agent/auth/resend-otp(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/agent_login(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/signup_agent(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/get_access_token(.*)`),
        methods: ["GET"],
      },
      {
        url: new RegExp(`/api/${version}/agent/airlines(.*)`),
        methods: ["GET"],
      },
      {
        url: new RegExp(`/api/${version}/agent/agent_forgot_password(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/agent_reset_password_token(.*)`),
        methods: ["POST"],
      },
      {
        url: new RegExp(`/api/${version}/agent/agent_reset_password(.*)`),
        methods: ["POST"],
      },
    ],
  });
}

async function isRevoked(req, payload) {
  return await verificationProcess(req, payload, env.JWT_SECRET);
}

/*export async function verifyToken(token) {
    try {

        return await jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        // Handle verification failure, e.g., token has expired or is invalid
        console.error('Error verifying token:', error);
        throw error; // You may choose to handle the error differently based on your requirements
    }
}*/
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

export const VersionOneJwt = authJwt(Constants.VERSION_ONE);
export const VersionTwoJwt = authJwt(Constants.VERSION_TWO);
