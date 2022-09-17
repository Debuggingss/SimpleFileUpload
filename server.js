import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as Utils from "./utils.js";
import fs from "fs";
import fileUpload from "express-fileupload";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "./public")));
app.use(fileUpload());

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.get("/dl/:filename", (req, res) => {
    const filename = req.params.filename;

    const exists = fs.existsSync(`${__dirname}/uploads/${filename}`);

    if (!exists) {
        res.sendFile(`${__dirname}/public/404.html`);
        return;
    }

    fs.promises
        .readFile(`${__dirname}/uploads/${filename}.json`)
        .then(JSON.parse)
        .then((json) => {
            res.download(`${__dirname}/uploads/${filename}`, json.filename);
        });
});

app.get("/:filename", (req, res) => {
    const filename = req.params.filename;

    const exists = fs.existsSync(`${__dirname}/uploads/${filename}`);

    if (!exists) {
        res.sendFile(`${__dirname}/public/404.html`);
        return;
    }

    fs.promises
        .readFile(`${__dirname}/uploads/${filename}.json`)
        .then(JSON.parse)
        .then((json) => {
            res.render("file", {
                file: json,
            });
        });
});

app.post("/upload", async (req, res) => {
    const password = req.body.password;

    if (!password || !req.files) {
        res.sendStatus(400);
        return;
    }

    const file = req.files.file;

    if (!file) {
        res.sendStatus(400);
        return;
    }

    if (password !== process.env.PASSWORD) {
        res.sendStatus(401);
        return;
    }

    let name = Utils.generateFilename(process.env.FILENAME_LENGTH);

    while (fs.existsSync(`${__dirname}/uploads/${name}`)) {
        name = Utils.generateFilename(process.env.FILENAME_LENGTH);
    }

    const metadata = {
        name: name,
        filename: file.name,
        uploaded_at: Date.now(),
        size: Math.floor((file.size / 1024 / 1024) * 100) / 100,
    };

    await fs.promises.writeFile(
        `${__dirname}/uploads/${name}.json`,
        JSON.stringify(metadata, null, 4)
    );
    await fs.promises.writeFile(
        `${__dirname}/uploads/${name}`,
        file.data
    );

    res.redirect(`/${name}`);

    Utils.logToWebhook(
        process.env.LOGGER_URL,
        metadata,
        req.headers["cf-connecting-ip"]
    );
});

app.listen(process.env.PORT, () => {
    console.log(`File Upload server running on port ${process.env.PORT}.`);
});
