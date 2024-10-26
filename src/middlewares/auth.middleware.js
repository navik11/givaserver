import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/ApiErrorRes.js";
import { pool } from "../db/index.js";
import { searchUser } from "../queries/allqueries.js";

dotenv.config({ path: "././.env" });

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.body.accessToken || req.cookies?.accessToken || req.query.accessToken || req.headers["x-access-token"];
    if (!token)
        return res
            .status(401)
            .send(
                new ApiResponse(
                    401,
                    "No access token provided",
                    "Unauthorized request"
                )
            );


    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res
            .status(401)
            .send(new ApiResponse(401, err, "Unauthorized request"));
    }

    const query = searchUser;
    const values = [decodedToken.username, decodedToken.username];
    let user;
    try {
        const queryResponse = await pool.query(query, values);
        user = queryResponse.rows[0];
    } catch (err) {
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    err,
                    "Unable to reach database, at this moment"
                )
            );
    }

    if (!user || user.length === 0) {
        return res
            .status(404)
            .send(new ApiResponse(404, null, "User not found"));
    }

    user.password = undefined;
    req.user = user;
    next();
});

export const verifyOTP = async (username, otp) => {

    if(!otp) return res.status(400).send(new ApiResponse(400, null, "OTP not provided"));
    if(!username) return res.status(400).send(new ApiResponse(400, null, "Username not provided"));

    const query = searchUser;
    const values = [username, username];
    let user;
    try {
        const queryResponse = await pool.query(query, values);
        user = queryResponse.rows[0];
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    err,
                    "Unable to reach database, at this moment"
                )
            );
    }

    if (!user || user.length === 0) {
        return res
            .status(404)
            .send(new ApiResponse(404, null, "User not found"));
    }

    const token = user.otp;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res
            .status(401)
            .send(new ApiResponse(401, err, "Unauthorized request"));
    }
    const validOTP = (decodedToken.otp === otp && decodedToken.username === username);
    if (!validOTP) {
        return false
    }

    return true;
};
