/*
import jwt from "jsonwebtoken";
import env from "../utils/validateENV";
import ErrorResponse from "../errorHandler/errorResponse";
import httpStatus from "http-status";
import * as argon2 from "argon2";
import { serialize } from "cookie";
import { generateUUID } from "./uuid";

import { Tables } from "./constant";
import pool from "../database/db";

/!**
 *
 * @param email
 * @param id
 * @param {string}  secret
 * @returns {string}
 *!/
export const generateJwtToken = (email, id, secret = env.JWT_SECRET) => {
  return jwt.sign(
    {
      email,
      id,
    },
    secret,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};

export const createActivationToken = (email) => {
  return jwt.sign(email, env.ACTIVATION_SECRET, {
    expiresIn: env.TOKEN_EXPIRES_IN,
  });
};

export const getEmailFromActivationToken = async (token) => {
  try {
    // console.log(token);
    // console.log(process.env.ACTIVATION_SECRET);
    const decoded = await jwt.verify(token, env.ACTIVATION_SECRET);
    // console.log(decoded);
    return decoded.email;
  } catch (error) {
    // console.log('here')
    throw error;
  }
};

// send data to user

export const sendLoginData = async (req, res, next, user) => {
  try {
    const token = generateJwtToken(user.email, user.id);
    user = {
      ...user,
      token,
    };

    // Remove 'password' and 'agent_id' fields from the new object

    console.log({ ip: req.loginIp }, req._remoteAddress);

    console.log({ data: req.deviceInfo });

    const loginInfo = {
      id: generateUUID(),
      token,
      loginIp: req.loginIp || " ",
      browser: req?.deviceInfo?.browser || "",
      os: req?.deviceInfo?.os || "",
      platform: req.deviceInfo.platform,
      source: req.deviceInfo.source,
      version: req.deviceInfo.version,
      deviceInfo: JSON.stringify(req.deviceInfo),
    };
    if (user.staffId) loginInfo.staffId = user.id;
    else if (user.agentId) loginInfo.agentId = user.id;
    else if (user.adminId) loginInfo.adminId = user.id;
    else loginInfo.userDocId = user.id;

    const insertQuery = `
            INSERT INTO ${Tables.USER_LOGIN_INFO} SET ?
        `;
    await pool.query(insertQuery, [loginInfo]);

    delete user.password;
    const tokenAge = parseInt(env.JWT_EXPIRES_IN, 10) * 24 * 3600;
    const cookieOptions = {
      httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
      maxAge: tokenAge, // Set the cookie to expire after a certain time (e.g., 1 hour)
      sameSite: "strict", // Restrict the cookie to same-site requests only
      secure: true, // Require HTTPS to send the cookie (in production)
    };

    const cookieString = serialize("token", token, cookieOptions);
    res.cookie("token", cookieString, cookieOptions);
    // document.cookie = cookieString;

    return user;
  } catch (err) {
    next(err);
  }
};

export const loginCheck = async (req, next, user) => {
  try {
    if (!user) {
      return `${req.body.email} not found`;
    }
    console.log(user);
    const isMatch = user.password === req.body.password;

    if (!isMatch) {
      return "wrong password";
    }
    //connection.release();
    return true;
  } catch (error) {
    next(error);
  }
};
*/
