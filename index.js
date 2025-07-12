// File: index.js
// Server Express.js untuk Ekstraksi Teks dari PDF

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');

const app = express();
const port = 4000;

// Daftar origin yang diizinkan
const allowedOrigins = [
  'http://localhost:3000',
  'https://sanf-ai.valvaltrizt.workers.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  }
}));


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/extract-text', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    console.log(`Menerima file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    const fileBuffer = req.file.buffer;

    const data = await pdf(fileBuffer);

    console.log('--- Hasil Ekstraksi PDF ---');
    console.log(`Total Halaman: ${data.numpages}`);
    console.log(`Total Karakter: ${data.text.length}`);
    console.log('Preview Teks (500 karakter pertama):');
    console.log(data.text);
    console.log('--------------------------');

    res.status(200).json({
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info,
      }
    });

  } catch (error) {
    console.error('Error saat memproses PDF:', error);
    res.status(500).json({ error: 'Gagal memproses file PDF di server.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server ekstraksi PDF berjalan di http://localhost:${port}`);
});
