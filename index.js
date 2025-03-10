const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Sicherstellen, dass der Upload-Ordner existiert
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer für Dateiuploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir)); // Statische Route für Bilder

// 📌 Upload-Endpunkt
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Kein Bild hochgeladen" });
    }

    const baseUrl = "https://randomstring.ngrok.io"; // Ersetze mit deiner URL
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const embedUrl = `${baseUrl}/embed/${req.file.filename}`;

    res.json({ 
        url: embedUrl,
        embed: embedUrl
    });
});

// 📌 Embed-Seite für Discord
app.get("/embed/:filename", (req, res) => {
    const { filename } = req.params;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    const filePath = path.join(uploadDir, filename);

    // Datei-Infos abrufen
    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).send("Bild nicht gefunden.");
        }

        const fileSize = (stats.size / 1024).toFixed(2) + " KB";
        const uploadTime = new Date(stats.birthtime).toLocaleString();

        res.send(`
            <meta property="og:title" content="Bild-Upload">
            <meta property="og:description" content="📸 Bildname: ${filename}\n📅 Hochgeladen am: ${uploadTime}\n📦 Größe: ${fileSize}">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="${imageUrl}">
            <meta name="twitter:card" content="summary_large_image">
        `);
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});