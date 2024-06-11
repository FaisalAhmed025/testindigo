import express from "express";
import validateRequest from "../share/validator";
import searchController from "./searchController";
import searchSchema from "./searchSchema";

const router = express.Router();

router.route("/").post(validateRequest(searchSchema), searchController);

export default router;
