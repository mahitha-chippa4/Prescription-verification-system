import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, Upload, LogOut, Wallet, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import web3Service from "../services/web3Service";
import PrescriptionService from "../services/prescriptionService";

function PharmacyDash() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isPharmacistAuthorized, setIsPharmacistAuthorized] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const qrCodeRef = useRef(null);
  
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { qrbox: { width: 250, height: 250 }, fps: 5 },
        false
      );

      function success(result) {
        scannerRef.current?.clear();
        scannerRef.current = null;
        setScanResult(result);
        setIsScanning(false);
        handleQRCodeScan(result);
      }

      function error(err) {
        console.warn(err);
      }

      scannerRef.current.render(success, error);
    }

    return () => {
      scannerRef.current?.clear();
      scannerRef.current = null;
      qrCodeRef.current?.clear();
      qrCodeRef.current = null;
    };
  }, [isScanning]);

  const checkWalletConnection = async () => {
    if (web3Service.isConnected()) {
      const account = web3Service.getCurrentAccount();
      setWalletAddress(account);
      setWalletConnected(true);
      
      // Check if pharmacist is authorized
      const isAuthorized = await web3Service.isPharmacistAuthorized();
      setIsPharmacistAuthorized(isAuthorized);
    }
  };

  const connectWallet = async () => {
    try {
      const account = await web3Service.connectWallet();
      setWalletAddress(account);
      setWalletConnected(true);
      
      // Check if pharmacist is authorized (gracefully handle if contract not deployed)
      try {
        const isAuthorized = await web3Service.isPharmacistAuthorized();
        setIsPharmacistAuthorized(isAuthorized);
        
        if (!isAuthorized) {
          console.log("Wallet connected but not authorized as pharmacist in smart contract");
          console.log("This is normal if the smart contract is not deployed yet");
        }
      } catch (authError) {
        console.log("Authorization check failed - contract may not be deployed:", authError.message);
        setIsPharmacistAuthorized(false);
      }
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const startScanning = () => {
    setScanResult("");
    setIsScanning(true);
    setVerificationResult(null);
    setPrescriptionData(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode("file-reader");
      }

      const result = await qrCodeRef.current.scanFile(file, true);
      setScanResult(result);
      handleQRCodeScan(result);

      qrCodeRef.current?.clear();
      qrCodeRef.current = null;
    } catch (error) {
      console.error("Error scanning file:", error);
      alert("Could not scan QR code from this image.");
    }

    fileInputRef.current.value = "";
  };

  const handleQRCodeScan = async (qrData) => {
    setIsVerifying(true);
    setVerificationResult(null);
    setPrescriptionData(null);

    try {
      // Parse QR code data
      const decryptedData = PrescriptionService.parseQRCodeData(qrData);
      setPrescriptionData(decryptedData);

      // Check if prescription is already used in Firebase
      const hash = PrescriptionService.generatePrescriptionHash(decryptedData);
      let firebaseUsedStatus = false;
      let prescriptionDocId = null;
      
      try {
        // Search for prescription in Firebase by hash
        const prescriptionsRef = collection(db, "prescriptions");
        const q = query(
          prescriptionsRef,
          where("prescriptionHash", "==", hash)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const prescriptionDoc = querySnapshot.docs[0];
          const prescriptionData = prescriptionDoc.data();
          firebaseUsedStatus = prescriptionData.isUsed || false;
          prescriptionDocId = prescriptionDoc.id;
        }
      } catch (firebaseError) {
        console.log("Firebase check failed:", firebaseError);
      }

      // Verify on blockchain (only if wallet connected and contract deployed)
      let blockchainResult = null;
      if (walletConnected && isPharmacistAuthorized) {
        try {
          blockchainResult = await web3Service.verifyPrescription(hash);
        } catch (blockchainError) {
          console.log("Blockchain verification failed:", blockchainError.message);
          console.log("Continuing with QR code data verification only");
        }
      }

      // Determine if prescription is used
      const isUsed = blockchainResult?.isUsed || firebaseUsedStatus;

      // Show results
      if (blockchainResult) {
        setVerificationResult({
          isValid: blockchainResult.isValid && !isUsed,
          isUsed: isUsed,
          doctorAddress: blockchainResult.doctorAddress,
          timestamp: blockchainResult.timestamp,
          hash: hash,
          verifiedOnBlockchain: true
        });
      } else {
        setVerificationResult({
          isValid: !isUsed,
          isUsed: isUsed,
          doctorAddress: decryptedData.doctorAddress || "Not verified on blockchain",
          timestamp: new Date(decryptedData.timestamp).getTime() / 1000,
          hash: hash,
          verifiedOnBlockchain: false,
          note: isUsed ? "Prescription has already been used" : (walletConnected ? "Blockchain verification unavailable" : "Connect wallet for blockchain verification"),
          prescriptionDocId: prescriptionDocId
        });
      }

    } catch (error) {
      console.error("Error processing prescription:", error);
      setVerificationResult({
        isValid: false,
        error: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const markPrescriptionAsUsed = async () => {
    if (!verificationResult || !verificationResult.isValid || verificationResult.isUsed) {
      return;
    }

    try {
      // Find prescription in Firebase and update status
      const prescriptionsRef = collection(db, "prescriptions");
      const q = query(
        prescriptionsRef,
        where("prescriptionHash", "==", verificationResult.hash)
      );
      const querySnapshot = await getDocs(q);

      let prescriptionDocId = null;
      if (!querySnapshot.empty) {
        prescriptionDocId = querySnapshot.docs[0].id;
        
        // Update Firebase document
        await updateDoc(doc(db, "prescriptions", prescriptionDocId), {
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedBy: walletAddress || "pharmacist"
        });

        console.log("Prescription marked as used in Firebase:", prescriptionDocId);
      }

      // Try to mark as used on blockchain if connected and authorized
      if (walletConnected && isPharmacistAuthorized && verificationResult.verifiedOnBlockchain) {
        try {
          await web3Service.usePrescription(verificationResult.hash);
          setVerificationResult(prev => ({ ...prev, isUsed: true }));
          alert("Prescription marked as used successfully (Firebase + Blockchain)!");
        } catch (blockchainError) {
          console.error("Blockchain marking failed:", blockchainError);
          setVerificationResult(prev => ({ ...prev, isUsed: true }));
          alert("Prescription marked as used (stored in Firebase only)");
        }
      } else {
        setVerificationResult(prev => ({ ...prev, isUsed: true }));
        alert("Prescription marked as used (stored in Firebase)");
      }
    } catch (error) {
      console.error("Error marking prescription as used:", error);
      alert("Failed to mark prescription as used. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Wallet Connection and Logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {isPharmacistAuthorized && (
                  <span className="text-xs bg-green-200 px-2 py-1 rounded">Authorized Pharmacist</span>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prescription Verification
          </h1>
          <p className="text-gray-600">
            Scan QR codes to verify prescription authenticity
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* QR Code Scanner Section */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800 ml-2">
                  Scan Prescription QR Code
                </h2>
              </div>

              {/* Scanner Container */}
              {isScanning && <div id="reader" className="mb-4"></div>}

              {!isScanning && !scanResult && (
                <div className="space-y-4">
                  <button
                    onClick={startScanning}
                    className="px-6 py-3 rounded-lg transition-colors flex items-center justify-center mx-auto w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera Scanning
                  </button>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-6 py-3 rounded-lg transition-colors flex items-center justify-center mx-auto w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload QR Image
                    </label>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              {isVerifying && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Verifying prescription...</p>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div className="mt-6 space-y-4">
                  <div className={`p-6 rounded-lg border-2 ${
                    verificationResult.isValid && !verificationResult.isUsed
                      ? 'bg-green-50 border-green-200' 
                      : verificationResult.isUsed
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-4">
                      {verificationResult.isValid && !verificationResult.isUsed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : verificationResult.isUsed ? (
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h3 className={`text-lg font-semibold ${
                        verificationResult.isValid && !verificationResult.isUsed ? 'text-green-800' 
                        : verificationResult.isUsed ? 'text-yellow-800' 
                        : 'text-red-800'
                      }`}>
                        {verificationResult.isValid && !verificationResult.isUsed 
                          ? 'Prescription Verified' 
                          : verificationResult.isUsed 
                          ? 'QR Code Already Scanned' 
                          : 'Verification Failed'}
                      </h3>
                    </div>
                    
                    {verificationResult.isValid && !verificationResult.isUsed ? (
                      <div className="space-y-2 text-green-700">
                        <p><strong>Status:</strong> Valid</p>
                        <p><strong>Doctor:</strong> {verificationResult.doctorAddress}</p>
                        <p><strong>Timestamp:</strong> {new Date(verificationResult.timestamp * 1000).toLocaleString()}</p>
                        <p><strong>Hash:</strong> {verificationResult.hash}</p>
                        {verificationResult.note && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Note:</strong> {verificationResult.note}
                          </p>
                        )}
                      </div>
                    ) : verificationResult.isUsed ? (
                      <div className="space-y-2 text-yellow-700">
                        <p><strong>Status:</strong> This prescription has already been used</p>
                        <p><strong>Message:</strong> QR Code Already Scanned - This prescription cannot be used again</p>
                        <p className="text-sm text-gray-600 mt-2">Note: Each prescription can only be used once to prevent fraud</p>
                      </div>
                    ) : (
                      <div className="text-red-700">
                        <p><strong>Error:</strong> {verificationResult.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startScanning}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Scan Another
                    </button>
                    
                    {verificationResult.isValid && !verificationResult.isUsed && (
                      <button
                        onClick={markPrescriptionAsUsed}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Mark as Used {!verificationResult.verifiedOnBlockchain && '(Local Only)'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Prescription Details */}
              {prescriptionData && (
                <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Prescription Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                    <div>
                      <p><strong>Patient:</strong> {prescriptionData.patientInfo?.patientName}</p>
                      <p><strong>Patient ID:</strong> {prescriptionData.patientInfo?.patientId}</p>
                      <p><strong>Age:</strong> {prescriptionData.patientInfo?.patientAge}</p>
                      <p><strong>Gender:</strong> {prescriptionData.patientInfo?.gender}</p>
                    </div>
                    <div>
                      <p><strong>Doctor:</strong> {prescriptionData.patientInfo?.doctorName}</p>
                      <p><strong>Date:</strong> {new Date(prescriptionData.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Medicines:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      {prescriptionData.medicines?.map((medicine, index) => (
                        <li key={index}>
                          {medicine.name} - {medicine.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden element for file scanning */}
            <div id="file-reader" style={{ display: "none" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyDash;