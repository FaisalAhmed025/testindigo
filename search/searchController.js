import httpStatus from "http-status";
import type { IResponse } from "../share/sendResponse";
import sendResponse from "../share/sendResponse";
import searchService from "./searchService";

const searchController = async (req, res, next) => {
  try {
    const searchResult = (await searchService(req, res, next)) || [];

    //console.log('before response', typeof  searchResult)
    const responseData: IResponse = {
      message: "successfully get search data",
      data: searchResult,
      success: true,
      status: httpStatus.OK,
    };

    searchResult && sendResponse(res, responseData);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default searchController;
