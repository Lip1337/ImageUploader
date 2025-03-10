const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Erstelle den Upload-Ordner, falls nicht vorhanden
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer-Konfiguration für Dateiuploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir)); // Bilder öffentlich zugänglich machen

app.get("/", (req, res) => {
    res.send("Welcome to ImageUploader.");
});

// Upload-Endpunkt für ShareX
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Kein Bild hochgeladen" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
