import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, Upload, LogOut, Wallet, CheckCircle, AlertCircle, User, ShieldCheck } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import web3Service from "../services/web3Service";
import PrescriptionService from "../services/prescriptionService";

function PatientDashBoard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
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
    }
  };

  const connectWallet = async () => {
    try {
      const account = await web3Service.connectWallet();
      setWalletAddress(account);
      setWalletConnected(true);
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

      // Verify on blockchain if wallet is connected
      if (walletConnected) {
        const hash = PrescriptionService.generatePrescriptionHash(decryptedData);
        const blockchainResult = await web3Service.verifyPrescription(hash);

        setVerificationResult({
          isValid: blockchainResult.isValid,
          isUsed: blockchainResult.isUsed,
          doctorAddress: blockchainResult.doctorAddress,
          timestamp: blockchainResult.timestamp,
          hash: hash
        });
      } else {
        // If no wallet connected, just show the prescription data
        setVerificationResult({
          isValid: true,
          isUsed: false,
          doctorAddress: decryptedData.doctorAddress,
          timestamp: new Date(decryptedData.timestamp).getTime() / 1000,
          hash: PrescriptionService.generatePrescriptionHash(decryptedData),
          note: "Blockchain verification requires wallet connection"
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

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => console.error("Logout Error:", error));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Patient Portal</h1>
              <p className="text-slate-400 text-sm">View and manage your digital prescriptions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
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
              <QrCode className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Scan Prescription
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Scan a QR code to view prescription details and verify its authenticity on the blockchain.
            </p>
          </div>

          {!isScanning && !scanResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button
                onClick={startScanning}
                className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
              >
                <Camera className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-200">Use Camera</span>
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
                  className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group cursor-pointer h-full"
                >
                  <Upload className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">Upload Image</span>
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
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300 font-medium animate-pulse">Verifying on Blockchain...</p>
            </div>
          )}

          {/* Results Section */}
          {(verificationResult || prescriptionData) && !isVerifying && (
            <div className="mt-8 space-y-6 animate-fade-in">
              {verificationResult && (
                <div className={`p-6 rounded-xl border ${verificationResult.isValid
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {verificationResult.isValid ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${verificationResult.isValid ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                        {verificationResult.isValid ? 'Valid Prescription' : 'Invalid Prescription'}
                      </h3>
                      <p className={`text-sm ${verificationResult.isValid ? 'text-emerald-400/80' : 'text-red-400/80'
                        }`}>
                        {verificationResult.isValid
                          ? 'Successfully verified on the blockchain'
                          : verificationResult.error || 'Verification failed'}
                      </p>
                    </div>
                  </div>

                  {verificationResult.isValid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/10">
                      <div>
                        <p className="text-xs text-emerald-400/60 uppercase tracking-wider font-semibold">Status</p>
                        <p className={`font-medium ${verificationResult.isUsed ? 'text-yellow-400' : 'text-emerald-300'}`}>
                          {verificationResult.isUsed ? 'Used / Dispensed' : 'Active / Valid'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400/60 uppercase tracking-wider font-semibold">Timestamp</p>
                        <p className="text-emerald-300 font-medium">
                          {new Date(verificationResult.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-emerald-400/60 uppercase tracking-wider font-semibold">Doctor Address</p>
                        <p className="text-emerald-300 font-mono text-xs sm:text-sm break-all">
                          {verificationResult.doctorAddress}
                        </p>
                      </div>
                      {verificationResult.note && (
                        <div className="sm:col-span-2 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-sm text-blue-300">
                          {verificationResult.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {prescriptionData && (
                <div className="bg-slate-800/50 rounded-xl border border-white/5 p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <User className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-slate-200">Prescription Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Patient Name</p>
                      <p className="text-lg text-slate-200">{prescriptionData.patientInfo?.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Patient ID</p>
                      <p className="text-lg text-slate-200">{prescriptionData.patientInfo?.patientId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Doctor Name</p>
                      <p className="text-lg text-slate-200">{prescriptionData.patientInfo?.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Date</p>
                      <p className="text-lg text-slate-200">
                        {new Date(prescriptionData.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Medicines</p>
                    <div className="space-y-2">
                      {prescriptionData.medicines?.map((medicine, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                          <span className="font-medium text-slate-200">{medicine.name}</span>
                          <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">{medicine.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={startScanning}
                className="w-full btn-primary py-3 rounded-xl font-semibold transform hover:-translate-y-1 transition-all"
              >
                Scan Another Prescription
              </button>
            </div>
          )}

          <div id="file-reader" style={{ display: "none" }}></div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashBoard;
