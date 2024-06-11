//import useragent from "useragent"
import useragent from "express-useragent";
import DeviceDetector from "device-detector-js";
import * as os from "os";

import {filterUserAgent} from "./filterDevice";
// Middleware to capture user agent information
export const captureDeviceInfo = (req, res, next) => {
    try {
        const userAgent = useragent.parse(req.headers["user-agent"]);
     //   console.log(userAgent)
        // const networkInterfaces = os.networkInterfaces();

        // console.log(networkInterfaces);
        // const browser = userAgent.toAgent();
        // const platform = userAgent.os.toString();
        // console.log(userAgent.toAgent(), userAgent.os.toString())
        //req.loginIp = req.ip; // Assuming IP is available in req

        console.log({a: req.headers['x-forwarded-for'], b: req.socket.remoteAddress, c: req.ip})

        req.deviceInfo = filterUserAgent(userAgent)
        //  console.log(req.deviceInfo)
        req.loginIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req._remoteAddress || req.ip || null;

        //console.log(req.loginIp)
        req.body = {
            ...req.body,
            //   browser,
            //   platform,
            // loginIp,
        };

        //console.log(  loginIp );
        next();
    } catch (err) {

        next(err);
    }
};
