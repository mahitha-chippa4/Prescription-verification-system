import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';

// Encryption key - In production, this should be stored securely
const ENCRYPTION_KEY = 'prescription-verification-key-2024';

class PrescriptionService {
  // Encrypt prescription data
  static encryptPrescriptionData(data) { // AES-256 encryption
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting prescription data:', error);
      throw error;
    }
  }

  // Decrypt prescription data
  static decryptPrescriptionData(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting prescription data:', error);
      throw error;
    }
  }

  // Generate a unique hash for the prescription
  static generatePrescriptionHash(prescriptionData) { //SHA-256 HASH
    try {
      const dataString = JSON.stringify(prescriptionData);
      const hash = CryptoJS.SHA256(dataString).toString();
      return hash;
    } catch (error) {
      console.error('Error generating prescription hash:', error);
      throw error;
    }
  }

  // Generate QR code for prescription
  static async generateQRCode(prescriptionData) {
    try {
      // Encrypt the prescription data
      const encryptedData = this.encryptPrescriptionData(prescriptionData);
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        qrCodeDataURL,
        encryptedData,
        hash: this.generatePrescriptionHash(prescriptionData)
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Parse QR code data
  static parseQRCodeData(qrCodeData) {
    try {
      const decryptedData = this.decryptPrescriptionData(qrCodeData);
      return decryptedData;
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      throw error;
    }
  }

  // Validate prescription data structure
  static validatePrescriptionData(data) {
    const requiredFields = ['patientInfo', 'medicines'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!data.patientInfo.patientName || !data.patientInfo.doctorName) {
      throw new Error('Missing required patient or doctor information');
    }

    if (!Array.isArray(data.medicines) || data.medicines.length === 0) {
      throw new Error('At least one medicine must be prescribed');
    }

    return true;
  }

  // Format prescription data for display
  static formatPrescriptionForDisplay(prescriptionData) {
    return {
      patient: {
        name: prescriptionData.patientInfo.patientName,
        id: prescriptionData.patientInfo.patientId,
        age: prescriptionData.patientInfo.patientAge,
        gender: prescriptionData.patientInfo.gender
      },
      doctor: {
        name: prescriptionData.patientInfo.doctorName
      },
      medicines: prescriptionData.medicines.map(medicine => ({
        name: medicine.name,
        duration: medicine.duration
      })),
      timestamp: prescriptionData.timestamp || new Date().toISOString()
    };
  }

  // Create prescription object with metadata
  static createPrescriptionObject(formData, doctorAddress) {
    const prescriptionData = {
      ...formData,
      timestamp: new Date().toISOString(),
      doctorAddress: doctorAddress,
      prescriptionId: this.generatePrescriptionHash(formData)
    };

    return prescriptionData;
  }
}

export default PrescriptionService;
