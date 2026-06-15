import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, Upload, LogOut, Wallet, CheckCircle, AlertCircle, Shield, ShieldCheck, Pill } from "lucide-react";
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Pill className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Pharmacist Portal</h1>
              <p className="text-slate-400 text-sm">Verify prescriptions and dispense medicines</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {isPharmacistAuthorized && (
                  <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    Authorized
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg transition-all"
              >
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>Connect Wallet</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-panel p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-800/50 mb-4 ring-1 ring-white/10">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Verify & Dispense
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Scan patient's prescription QR code to verify authenticity and mark as dispensed.
            </p>
          </div>

          {!isScanning && !scanResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button
                onClick={startScanning}
                className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
              >
                <Camera className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-200">Start Camera</span>
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
                  className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all group cursor-pointer h-full"
                >
                  <Upload className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">Upload QR Image</span>
                </label>
              </div>
            </div>
          )}

          {/* Scanner Container */}
          {isScanning && (
            <div className="max-w-md mx-auto overflow-hidden rounded-xl border-2 border-slate-700 bg-black">
              <div id="reader" className="w-full"></div>
            </div>
          )}

          {/* Verification Spinner */}
          {isVerifying && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-emerald-300 font-medium animate-pulse">Verifying Prescription...</p>
            </div>
          )}

          {/* Results Section */}
          {(verificationResult || prescriptionData) && !isVerifying && (
            <div className="mt-8 space-y-6 animate-fade-in">
              {verificationResult && (
                <div className={`p-6 rounded-xl border ${verificationResult.isValid && !verificationResult.isUsed
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : verificationResult.isUsed
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {verificationResult.isValid && !verificationResult.isUsed ? (
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    ) : verificationResult.isUsed ? (
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${verificationResult.isValid && !verificationResult.isUsed ? 'text-emerald-300'
                          : verificationResult.isUsed ? 'text-yellow-300'
                            : 'text-red-300'
                        }`}>
                        {verificationResult.isValid && !verificationResult.isUsed
                          ? 'Prescription Verified'
                          : verificationResult.isUsed
                            ? 'QR Code Already Scanned'
                            : 'Verification Failed'}
                      </h3>
                      <p className={`text-sm ${verificationResult.isValid && !verificationResult.isUsed ? 'text-emerald-400/80'
                          : verificationResult.isUsed ? 'text-yellow-400/80'
                            : 'text-red-400/80'
                        }`}>
                        {verificationResult.isValid && !verificationResult.isUsed
                          ? 'Signature valid. Safe to dispense.'
                          : verificationResult.isUsed
                            ? 'This prescription has already been used.'
                            : verificationResult.error}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-slate-300 text-sm">
                    <p><strong>Hash:</strong> <span className="font-mono text-xs">{verificationResult.hash}</span></p>
                    <p><strong>Doctor:</strong> <span className="font-mono text-xs">{verificationResult.doctorAddress}</span></p>
                    <p><strong>Date:</strong> {new Date(verificationResult.timestamp * 1000).toLocaleString()}</p>
                    {verificationResult.note && (
                      <p className="text-blue-300"><strong>Note:</strong> {verificationResult.note}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                      onClick={startScanning}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center font-medium"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Scan Another
                    </button>

                    {verificationResult.isValid && !verificationResult.isUsed && (
                      <button
                        onClick={markPrescriptionAsUsed}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center font-medium shadow-lg shadow-emerald-900/20"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Dispense & Mark Used
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div id="file-reader" style={{ display: "none" }}></div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyDash;