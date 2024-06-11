import {currentDhakaMoment} from "./partialHelper/partialHelper";
import moment from "moment";

/**
 * Creates a Moment object representing the specified time.
 * If the input time is valid, returns a Moment object representing the time in the Dhaka time zone.
 * If the input time is invalid, return the current time in the Dhaka time zone.
 * @param {string} time - The time string in the format 'YYYY-MM-DD HH:mm:ss'.
 * @returns {moment.Moment} A Moment object representing the specified time in the Dhaka time zone.
 */
export function makeMoment(time) {

    return  moment(time) || currentDhakaMoment()
}