import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiErrorRes.js";
import dotenv from "dotenv";
import { pool } from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendMail } from "../utils/nodemailer.js";
import fs from "fs";
import { validationResult } from "express-validator";
import { activateUser, searchUser } from "../queries/allqueries.js";
import { verifyOTP } from "../middlewares/auth.middleware.js";

dotenv.config({ path: "././.env" });

const checkHealth = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                { "User route status": "Healthy" },
                "User route is working fine"
            )
        );
});


const addProduct = asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    const { name, description, price, stock, material, weight, gemstone, carat, size, type, rating } = req.body;

    let avatarLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const avatar = "";

    let newProduct;
    try {
        const queryText = `
          INSERT INTO givaproduct (name, description, price, avatar, stock, material, weight, gemstone, carat, size, type, rating)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;
        `;
        const values = [
            name,
            description,
            price,
            avatar?.url || "",
            stock,
            material,
            weight,
            gemstone,
            (!carat || carat == "") ? 0 : carat,
            size,
            type,
            (!rating || rating == "") ? 0 : rating
        ];
        const res = await pool.query(queryText, values);
        newProduct = res.rows[0];
        console.log('New Product Created:', res.rows[0]);
    } catch (error) {
        console.error('Error inserting product:', error);
        return res.status(500).send(new ApiResponse(500, error, "Error inserting product"));
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, newProduct, "Product added to store")
        );
});

const updateProduct = asyncHandler(async (req, res) => {

    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    null,
                    "Product ID not provided"
                )
            );
    }
    const query = 'SELECT * FROM givaproduct WHERE id = $1';
    let product;
    try {
        const queryResponse = await pool.query(query, [id]);
        product = queryResponse.rows[0];
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    const { name, description, price, stock, material, weight, gemstone, carat, size, type, rating } = req.body;

    let avatarLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const avatar = "";

    let updatedProduct;
    try {
        const queryText = `
      UPDATE givaproduct
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        avatar = COALESCE($4, avatar),
        stock = COALESCE($5, stock),
        material = COALESCE($6, material),
        weight = COALESCE($7, weight),
        gemstone = COALESCE($8, gemstone),
        carat = COALESCE($9, carat),
        size = COALESCE($10, size),
        type = COALESCE($11, type),
        rating = COALESCE($12, rating)
      WHERE id = $13
      RETURNING *;
    `;
        const values = [
            name || product.name,
            description || product.description,
            price || product.price,
            avatar?.url || product.avatar || "",
            stock || product.stock,
            material || product.material,
            weight || product.weight,
            gemstone || product.gemstone,
            carat === undefined || carat === "" ? 0 : carat,
            size || product.size,
            type || product.type,
            rating === undefined || rating === "" ? 0 : rating,
            product.id  // `id` of the product to update
        ];
        const res = await pool.query(queryText, values);
        updatedProduct = res.rows[0];
        console.log('New Product Created:', res.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).send(new ApiResponse(500, error, "Error updating product"));
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, updateProduct, "Product updated to store")
        );
});

const register = asyncHandler(async (req, res) => {

    const { username, password, email, fullname } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    let avatarLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    const query = searchUser;
    const values = [email, username];
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

    console.log(user);

    if (user) {
        if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
        return res
            .status(404)
            .send(new ApiResponse(400, null, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    const otptoken = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const text = `Your activation OTP for Giva is ${otp}, please do not share it with anyone.`;
    const html = `<p>Your activation OTP for Giva is <strong>${otp}</strong>, please do not share it with anyone.</p><br><br>Thanks,<br>Sachida at Giva`;

    try {
        await sendMail(email, "Activate your Giva account", text, html);
    } catch (err) {
        console.log(err);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const avatar = "";

    let newUser;
    try {
        const queryText = `
          INSERT INTO givauser (username, password, email, fullname, avatar, otp)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *;
        `;
        const values = [username, hashedPassword, email, fullname, avatar?.url || "", otptoken];
        const res = await pool.query(queryText, values);
        newUser = res.rows[0];
        console.log('New User Created:', res.rows[0]);
    } catch (error) {
        console.error('Error inserting user:', error);
        return res.status(500).send(new ApiResponse(500, error, "Error inserting user"));
    }

    newUser.password = undefined;
    newUser.otp = undefined;

    return res
        .status(201)
        .json(
            new ApiResponse(201, newUser, "User registered Successfully")
        );
});

const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    const { username, password } = req.body;

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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res
            .status(401)
            .send(new ApiResponse(401, null, "Invalid password"));
    }

    const accessToken = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.SESSION_EXPIRY }
    );

    const httpOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    user.password = undefined;
    user.otp = undefined;

    return res
        .status(200)
        .cookie("accessToken", accessToken, httpOptions)
        .send(
            new ApiResponse(
                200,
                { user, accessToken },
                "User logged in successfully"
            )
        );
});

const getAllProducts = asyncHandler(async (req, res) => {

    const query = 'SELECT * FROM givaproduct';
    let allProducts;
    try {
        const queryResponse = await pool.query(query);
        allProducts = queryResponse.rows;
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

    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                allProducts,
                "All products fetched successfully"
            )
        );
});

const getProduct = asyncHandler(async (req, res) => {

    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    null,
                    "Product ID not provided"
                )
            );
    }
    const query = 'SELECT * FROM givaproduct WHERE id = $1';
    let product;
    try {
        const queryResponse = await pool.query(query, [id]);
        product = queryResponse.rows[0];
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

    if(!product) {
        return res
            .status(404)
            .send(new ApiResponse(404, null, "Product not found"));
    }

    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                product,
                "All products fetched successfully"
            )
        );
});

const removeProduct = asyncHandler(async (req, res) => {

    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    null,
                    "Product ID not provided"
                )
            );
    }
    const query = 'DELETE FROM givaproduct WHERE id = $1';
    let product;
    try {
        const queryResponse = await pool.query(query, [id]);
        product = queryResponse.rows[0];
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

    return res
        .status(200)
        .send(
            new ApiResponse(
                200,
                product,
                "Product deleted successfully"
            )
        );
});

const verifyOTPForActivation = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .send(
                new ApiResponse(
                    400,
                    errors.array(),
                    "Validation error, empty fields"
                )
            );
    }

    const { username, otp } = req.body;

    const isValid = await verifyOTP(username, otp);

    if (!isValid) {
        return res
            .status(401)
            .send(new ApiResponse(401, null, "Invalid OTP"));
    }

    const query = activateUser;
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

    return res
        .status(200)
        .cookie("accessToken", accessToken, httpOptions)
        .send(
            new ApiResponse(
                200,
                { user, accessToken },
                "User logged in successfully"
            )
        );
});

const logout = asyncHandler(async (req, res) => {
    const httpOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    return res
        .status(200)
        .clearCookie("accessToken", httpOptions)
        .clearCookie("refreshToken", httpOptions)
        .send(new ApiResponse(200, {}, "User logged out successfully"));
});

export { checkHealth, login, logout, register, verifyOTPForActivation, addProduct, getAllProducts, getProduct, updateProduct, removeProduct };
