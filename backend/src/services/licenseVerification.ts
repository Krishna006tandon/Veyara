import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VerificationResult {
  extractedText: string;
  issuingAuthority: string | null;
  businessName: string | null;
  expiryDate: string | null; // YYYY-MM-DD
  facesDetected: number;
  largestFaceAreaRatio: number; // 0–1
  confidence: number; // 0–1
}

export class LicenseVerificationService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async performSafetyCheck(imageBase64: string): Promise<{ isInappropriate: boolean; reason: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const safetyPrompt = `
        SAFETY CHECK: Detect if this image contains ANY people or inappropriate content.
        
        REJECT if you see:
        - Human faces, people, bodies
        - Selfies, portraits
        - Inappropriate content
        - Non-document content (nature, food, objects, etc.)
        
        ONLY allow if this is clearly a document/certificate/license.
        
        Respond with ONLY JSON:
        {"isInappropriate": true/false, "reason": "explanation"}
        
        If you see ANY person or face, return {"isInappropriate": true}
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([safetyPrompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      console.log('Safety Check Raw Response:', text);
      
      let safetyResult;
      try {
        safetyResult = JSON.parse(text);
      } catch (parseError) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          safetyResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`No JSON found in safety response: ${text}`);
        }
      }
      
      console.log('Safety Check Result:', JSON.stringify(safetyResult, null, 2));
      return safetyResult;
      
    } catch (error) {
      // If safety check fails, assume it's inappropriate for safety
      return {
        isInappropriate: true,
        reason: 'Safety check failed - manual review required'
      };
    }
  }

  async verifyLicense(imageBase64: string): Promise<VerificationResult> {
    try {
      console.log('Starting license verification...');
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        CRITICAL: Analyze this image for business license verification.
        
        FIRST - Detect faces:
        - Count ALL human faces in the image (facesDetected)
        - Calculate the area ratio of the LARGEST face compared to total image area (largestFaceAreaRatio)
        - If this is a selfie/dominant face photo, largestFaceAreaRatio should be > 0.3
        - If this is a license with small photo, largestFaceAreaRatio should be < 0.2
        
        THEN - Extract document information:
        - ALL text from the document (extractedText)
        - Issuing authority (issuingAuthority)
        - Business name (businessName) 
        - Expiry date in YYYY-MM-DD format (expiryDate)
        - Overall confidence (confidence: 0.0-1.0)
        
        Respond with ONLY JSON:
        {
          "extractedText": "all text or empty string",
          "issuingAuthority": "authority or null",
          "businessName": "business name or null", 
          "expiryDate": "YYYY-MM-DD or null",
          "facesDetected": number,
          "largestFaceAreaRatio": 0.0-1.0,
          "confidence": 0.0-1.0
        }
        
        IMPORTANT: Be accurate about face detection. Selfies have large face ratios (>0.3).
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini Raw Response:', text);

      let verificationResult: VerificationResult;
      
      try {
        verificationResult = JSON.parse(text) as VerificationResult;
      } catch (parseError) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          verificationResult = JSON.parse(jsonMatch[0]) as VerificationResult;
        } else {
          throw new Error(`No JSON found in response: ${text}`);
        }
      }
      
      console.log('Parsed Result:', JSON.stringify(verificationResult, null, 2));
      
      // Validate required fields
      if (!verificationResult.extractedText || verificationResult.facesDetected === undefined || verificationResult.largestFaceAreaRatio === undefined) {
        throw new Error('Invalid verification response format');
      }

      // HARD RULE: Selfie detection = immediate rejection, never manual review
      if (verificationResult.facesDetected > 0 && verificationResult.largestFaceAreaRatio >= 0.28) {
        console.warn('Service layer: Selfie detected - hard reject');
        // Return data that will trigger hard reject in route
        return {
          ...verificationResult,
          confidence: 0.1 // Low confidence to ensure rejection
        };
      }

      return verificationResult;
    } catch (error) {
      console.error('License verification error:', error);
      
      // Return a default response for errors
      return {
        extractedText: '',
        issuingAuthority: null,
        businessName: null,
        expiryDate: null,
        facesDetected: 0,
        largestFaceAreaRatio: 0,
        confidence: 0
      };
    }
  }

  async verifyLicenseFromBuffer(imageBuffer: Buffer): Promise<VerificationResult> {
    const imageBase64 = imageBuffer.toString('base64');
    return this.verifyLicense(imageBase64);
  }
}

export const licenseVerificationService = new LicenseVerificationService();
