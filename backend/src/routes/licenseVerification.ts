import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { licenseVerificationService } from '../services/licenseVerification';

const router = express.Router();

/* ======================================================
   MULTER CONFIG
   ====================================================== */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false);
  },
});

/* ======================================================
   POST /verify
   ====================================================== */

router.post('/verify', upload.single('license'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { size, mimetype, buffer } = req.file;

    /* ---------------- FILE CHECKS ---------------- */

    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File too large (max 5MB)',
      });
    }

    if (size < 100 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File too small',
      });
    }

    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files allowed',
      });
    }

    /* ---------------- IMAGE QUALITY ---------------- */

    const meta = await sharp(buffer).metadata();

    if (!meta.width || !meta.height || meta.width < 600 || meta.height < 600) {
      return res.status(400).json({
        success: false,
        status: 'REJECTED',
        message: 'Image too low quality or blurry',
      });
    }

    const imageBuffer = await sharp(buffer)
      .resize({ width: 1400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    /* ---------------- AI / OCR ---------------- */

    const result = await licenseVerificationService.verifyLicenseFromBuffer(
      imageBuffer
    );

    const text = (result.extractedText || '').toLowerCase();

    /* ======================================================
       1️⃣ HARD SELFIE REJECTION (NO OVERRIDE)
       ====================================================== */

    const isSelfie =
      result.facesDetected > 0 &&
      result.largestFaceAreaRatio >= 0.25;

    if (isSelfie) {
      return res.status(422).json({
        success: false,
        status: 'REJECTED',
        code: 'SELFIE_DETECTED',
        message: 'Selfie detected. Upload a business licence only.',
      });
    }

    /* ======================================================
       2️⃣ TEXT READABILITY (INDIA FRIENDLY)
       ====================================================== */

    if (text.length < 80) {
      return res.status(400).json({
        success: false,
        status: 'REJECTED',
        message: 'Licence text not readable',
      });
    }

    /* ======================================================
       3️⃣ AUTHORITY CHECK (OCR-TOLERANT)
       ====================================================== */

    const AUTHORITY_PATTERNS = [
      /municipal/i,
      /nagar/i,
      /corporation/i,
      /trade\s*licen/i,
      /shop/i,
      /establishment/i,
      /local\s*authority/i,
      /municipality/i,
    ];

    const authorityValid = AUTHORITY_PATTERNS.some(rx => rx.test(text));

    if (!authorityValid) {
      return res.status(400).json({
        success: false,
        status: 'MANUAL_REVIEW',
        message: 'Issuing authority unclear',
      });
    }

    /* ======================================================
       4️⃣ BUSINESS NAME CHECK (REALISTIC)
       ====================================================== */

    if (!result.businessName) {
      return res.status(400).json({
        success: false,
        status: 'MANUAL_REVIEW',
        message: 'Business name not detected',
      });
    }

    const businessName = result.businessName.toLowerCase();

    const looksLikeBusiness =
      businessName.length >= 8 &&
      !/^[a-z]+(\s[a-z]+)?$/i.test(businessName);

    if (!looksLikeBusiness) {
      return res.status(400).json({
        success: false,
        status: 'MANUAL_REVIEW',
        message: 'Business name unclear',
      });
    }

    /* ======================================================
       5️⃣ EXPIRY CHECK (OPTIONAL IN INDIA)
       ====================================================== */

    let expiryValid = false;

    if (result.expiryDate) {
      const expiry = new Date(result.expiryDate);
      const today = new Date();
      expiry.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (expiry < today) {
        return res.status(400).json({
          success: false,
          status: 'REJECTED',
          message: 'Licence expired',
        });
      }

      expiryValid = true;
    }

    /* ======================================================
       6️⃣ FINAL TRUST SCORE
       ====================================================== */

    let score = 0;
    score += authorityValid ? 30 : 0;
    score += looksLikeBusiness ? 25 : 0;
    score += text.length > 150 ? 20 : 10;
    score += expiryValid ? 10 : 0;

    /* ======================================================
       FINAL DECISION
       ====================================================== */

    if (score >= 60) {
      return res.json({
        success: true,
        status: 'APPROVED',
        trustScore: score,
        data: {
          businessName: result.businessName,
          expiryDate: result.expiryDate || null,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    return res.status(400).json({
      success: false,
      status: 'MANUAL_REVIEW',
      trustScore: score,
      message: 'Licence needs manual review',
    });

  } catch (err) {
    console.error('Licence verification error:', err);
    return res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Licence verification failed',
    });
  }
});

/* ======================================================
   EXPORT
   ====================================================== */

export default router;
