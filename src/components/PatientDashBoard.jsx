// import React, { useEffect, useState, useRef } from "react";
// import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
// import { QrCode, Camera, CameraOff, Upload } from "lucide-react";

// function PatientDashBoard() {
//   const [scanResult, setScanResult] = useState("");
//   const [isScanning, setIsScanning] = useState(false);
//   const scannerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const qrCodeRef = useRef(null);
//   useEffect(() => {
//     if (isScanning && !scannerRef.current) {
//       // Initialize scanner only when scanning starts and scanner doesn't exist
//       scannerRef.current = new Html5QrcodeScanner(
//         "reader",
//         {
//           qrbox: {
//             width: 250,
//             height: 250,
//           },
//           fps: 5,
//         },
//         false
//       );

//       function success(result) {
//         if (scannerRef.current) {
//           scannerRef.current.clear();
//           scannerRef.current = null;
//         }
//         setScanResult(result);
//         setIsScanning(false);
//       }

//       function error(err) {
//         console.warn(err);
//       }

//       scannerRef.current.render(success, error);
//     }

//     return () => {
//       if (scannerRef.current) {
//         scannerRef.current.clear();
//         scannerRef.current = null;
//       }
//       if (qrCodeRef.current) {
//         qrCodeRef.current.clear();
//         qrCodeRef.current = null;
//       }
//     };
//   }, [isScanning]);

//   const startScanning = () => {
//     setScanResult("");
//     setIsScanning(true);
//   };

//   const stopScanning = () => {
//     if (scannerRef.current) {
//       scannerRef.current.clear();
//       scannerRef.current = null;
//     }
//     setIsScanning(false);
//   };

//   const handleFileUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       // Create a new instance for file scanning if it doesn't exist
//       if (!qrCodeRef.current) {
//         qrCodeRef.current = new Html5Qrcode("file-reader");
//       }

//       const result = await qrCodeRef.current.scanFile(file, true);
//       setScanResult(result);

//       // Clean up after successful scan
//       if (qrCodeRef.current) {
//         qrCodeRef.current.clear();
//         qrCodeRef.current = null;
//       }
//     } catch (error) {
//       console.error("Error scanning file:", error);
//       alert(
//         "Could not scan QR code from this image. Please try another image or use the camera scanner."
//       );
//     }

//     // Reset file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="p-8">
//           <div className="flex items-center justify-center mb-6">
//             <QrCode className="w-8 h-8 text-blue-600" />
//             <h1 className="text-2xl font-bold text-gray-800 ml-2">
//               Upload Prescription QR Code
//             </h1>
//           </div>

//           {/* QR Code Scanner Container */}
//           {isScanning && <div id="reader" className="mb-4"></div>}

//           {!isScanning && !scanResult && (
//             <div className="space-y-4">
//               <button
//                 onClick={startScanning}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto w-full"
//               >
//                 <Camera className="w-5 h-5 mr-2" />
//                 Start Camera Scanning
//               </button>

//               <div className="relative">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                   ref={fileInputRef}
//                   id="file-upload"
//                 />
//                 <label
//                   htmlFor="file-upload"
//                   className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mx-auto w-full cursor-pointer"
//                 >
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload QR Image
//                 </label>
//               </div>
//             </div>
//           )}

//           {scanResult && (
//             <div className="mt-6 space-y-4">
//               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                 <h2 className="text-lg font-semibold text-green-800 mb-2">
//                   Scan Result:
//                 </h2>
//                 <p className="text-green-700 break-all">{scanResult}</p>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={startScanning}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
//                 >
//                   <Camera className="w-5 h-5 mr-2" />
//                   Scan Again
//                 </button>
//                 <label
//                   htmlFor="file-upload"
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
//                 >
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload New
//                 </label>
//               </div>
//             </div>
//           )}

//           {/* Hidden element for file scanning */}
//           <div id="file-reader" style={{ display: "none" }}></div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PatientDashBoard;


import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, Upload, LogOut, Wallet, CheckCircle, AlertCircle, User } from "lucide-react";
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
        alert("Logged out successfully!");
        window.location.href = "/"; // Redirect to home or login page
      })
      .catch((error) => console.error("Logout Error:", error));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Wallet Connection and Logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet (Optional)</span>
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
          <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            View Prescription
          </h1>
          <p className="text-gray-600">
            Scan QR codes to view your prescription details
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* QR Code Scanner Section */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8 text-purple-600" />
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
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center w-full"
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
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full cursor-pointer"
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Processing prescription...</p>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div className="mt-6 space-y-4">
                  <div className={`p-6 rounded-lg border-2 ${
                    verificationResult.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-4">
                      {verificationResult.isValid ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h3 className={`text-lg font-semibold ${
                        verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {verificationResult.isValid ? 'Prescription Valid' : 'Invalid Prescription'}
                      </h3>
                    </div>
                    
                    {verificationResult.isValid ? (
                      <div className="space-y-2 text-green-700">
                        <p><strong>Status:</strong> {verificationResult.isUsed ? 'Already Used' : 'Valid'}</p>
                        <p><strong>Doctor:</strong> {verificationResult.doctorAddress}</p>
                        <p><strong>Timestamp:</strong> {new Date(verificationResult.timestamp * 1000).toLocaleString()}</p>
                        {verificationResult.note && (
                          <p className="text-sm text-blue-600"><strong>Note:</strong> {verificationResult.note}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-700">
                        <p><strong>Error:</strong> {verificationResult.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center">
                    <button
                      onClick={startScanning}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Scan Another
                    </button>
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

export default PatientDashBoard;

