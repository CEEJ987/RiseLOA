const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const compression = require('compression'); // ✅ Add this
const fs = require('fs');

const app = express();
const PORT = 5000;

// ✅ Enable Gzip compression
app.use(compression());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload config (store PDFs in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to receive signed PDF and send it via email
app.post('/submit-signed-pdf', upload.single('signedPdf'), async (req, res) => {
  const { name, email } = req.body;
  const pdfBuffer = req.file.buffer;

  try {
    // Optional: Save PDF locally
    fs.writeFileSync(`signed-${Date.now()}.pdf`, pdfBuffer);

    // Email config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',         // Replace
        pass: 'your-app-password',            // Use App Password (not your main password)
      },
    });

    await transporter.sendMail({
      from: '"Rise LOA" <your-email@gmail.com>',
      to: email,
      subject: 'Signed LOA Document',
      text: `Hi ${name},\n\nPlease find your signed LOA document attached.`,
      attachments: [
        {
          filename: 'signed-loa.pdf',
          content: pdfBuffer,
        },
      ],
    });

    res.status(200).json({ message: 'PDF received and emailed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process and send PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
