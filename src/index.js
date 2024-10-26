import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

console.log("Initializing the server");
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3045;

app.listen(port, host, () => {
    console.log(`Sever is live at port: ${host + ":" + port}`);
});