import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

console.log("Initializing the server");
// const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Sever is live at port: ${port}`);
});