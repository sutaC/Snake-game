import express from "express";
import path from "path";
const app = express();
app.use(express.static(path.join("./public")));
app.get("/", (req, res) => {
    res.sendFile("./index.html", { root: "pages" });
});
app.listen(3000, () => {
    console.log("Listening on http://127.0.0.1:3000/");
});
