import { Router } from "express";
import { addProduct, checkHealth, getAllProducts, getProduct, login, logout, register, removeProduct, updateProduct, verifyOTPForActivation } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiErrorRes.js";
import { upload } from "../middlewares/multer.middleware.js";
import { body } from "express-validator";

const router = Router();

router.route("/health").get(checkHealth);

router.route("/allProducts").get(getAllProducts);

router.route("/product/:id").get(getProduct);

router.route("/product").post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    body("name")
        .notEmpty()
        .withMessage("Please enter name for the product"),
    body("price")
        .notEmpty()
        .withMessage("There must be some price"),
    body("weight")
        .notEmpty()
        .withMessage("Email cannot be empty"),
    verifyJWT,
    addProduct);

router.route("/product/:id").put(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    body("name")
        .notEmpty()
        .withMessage("Please enter name for the product"),
    body("price")
        .notEmpty()
        .withMessage("There must be some price"),
    body("weight")
        .notEmpty()
        .withMessage("Email cannot be empty"),
    verifyJWT,
    updateProduct
);

router.route("/product/:id").delete(verifyJWT, removeProduct);

// Authentication Routes
router.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    body("username")
        .notEmpty()
        .withMessage("Please enter username or email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password cannot be empty"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email cannot be empty"),
    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Fullname cannot be empty"),
    register);

router.route("/login").post(
    upload.array(),
    body("username")
        .notEmpty()
        .withMessage("Please enter username or email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password cannot be empty"), login);

router.route("/verifyotp").post(
    upload.array(),
    body("username")
        .notEmpty()
        .withMessage("Please enter username or email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password cannot be empty"), verifyOTPForActivation);

router.route("/checkAuth").post(verifyJWT, (req, res) => {
    return res
        .status(200)
        .send(new ApiResponse(200, req.user, "User is authenticated"));
});


router.route("/logout").get(logout);

export default router;
