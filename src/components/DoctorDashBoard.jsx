// import React from "react";
// import { useForm, useFieldArray, Controller } from "react-hook-form";
// import {
//   Plus,
//   Minus,
//   Stethoscope,
//   User,
//   Clock,
//   Pill as Pills,
// } from "lucide-react";

// function DoctorDashboard() {
//   const { control, handleSubmit, register } = useForm({
//     defaultValues: {
//       patientInfo: {
//         patientName: "",
//         doctorName: "",
//         patientAge: "",
//         gender: "",
//         patientId: "",
//       },
//       medicines: [{ name: "", duration: "" }],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "medicines",
//   });

//   const onSubmit = (data) => {
//     console.log(data);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Medical Prescription
//           </h1>
//           <p className="text-gray-600">
//             Create a detailed prescription for your patient
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="p-8">
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//               {/* Patient and Doctor Information */}
//               <div className="bg-blue-50 rounded-xl p-6 space-y-6">
//                 <div className="flex items-center space-x-2 mb-4">
//                   <User className="h-5 w-5 text-blue-600" />
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Patient Information
//                   </h2>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Patient ID
//                     </label>
//                     <input
//                       type="text"
//                       {...register("patientInfo.patientId")}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                       placeholder="Enter Patient ID"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Patient Name
//                     </label>
//                     <input
//                       type="text"
//                       {...register("patientInfo.patientName")}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                       placeholder="Enter Patient Name"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Doctor Name
//                     </label>
//                     <input
//                       type="text"
//                       {...register("patientInfo.doctorName")}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                       placeholder="Enter Doctor Name"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Patient Age
//                     </label>
//                     <input
//                       type="number"
//                       {...register("patientInfo.patientAge")}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                       placeholder="Enter Age"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Gender
//                     </label>
//                     <select
//                       {...register("patientInfo.gender")}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                     >
//                       <option value="">Select Gender</option>
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Medicines Section */}
//               <div className="bg-indigo-50 rounded-xl p-6 space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Pills className="h-5 w-5 text-indigo-600" />
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Prescribed Medicines
//                     </h2>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => append({ name: "", duration: "" })}
//                     className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
//                   >
//                     <Plus className="w-4 h-4" />
//                     <span>Add Medicine</span>
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {fields.map((item, index) => (
//                     <div
//                       key={item.id}
//                       className="bg-white rounded-lg p-4 shadow-sm"
//                     >
//                       <div className="flex items-start gap-4">
//                         <div className="flex-grow space-y-4">
//                           <div className="flex items-center gap-4">
//                             <div className="flex-grow">
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Medicine Name
//                               </label>
//                               <Controller
//                                 control={control}
//                                 name={`medicines[${index}].name`}
//                                 render={({ field }) => (
//                                   <input
//                                     type="text"
//                                     placeholder="Enter medicine name"
//                                     {...field}
//                                     className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                   />
//                                 )}
//                               />
//                             </div>
//                             <div className="flex-grow">
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Duration
//                               </label>
//                               <Controller
//                                 control={control}
//                                 name={`medicines[${index}].duration`}
//                                 render={({ field }) => (
//                                   <div className="relative">
//                                     <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
//                                     <input
//                                       type="text"
//                                       placeholder="e.g., 7 days"
//                                       {...field}
//                                       className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                     />
//                                   </div>
//                                 )}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                         {fields.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() => remove(index)}
//                             className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
//                           >
//                             <Minus className="w-5 h-5" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//                 >
//                   Generate Prescription
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DoctorDashboard;


import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Minus, Stethoscope, User, Clock, Pill as Pills, LogOut, Wallet, QrCode, CheckCircle } from "lucide-react";
import { db } from "../../firebaseConfig"; // Import Firebase
import { addDoc, collection } from "firebase/firestore"; // Import Firestore functions
import { getAuth, signOut } from "firebase/auth"; // Import Firebase Auth
import { useNavigate } from "react-router-dom"; // Import React Router for navigation
import web3Service from "../services/web3Service";
import PrescriptionService from "../services/prescriptionService";

function DoctorDashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isDoctorAuthorized, setIsDoctorAuthorized] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      patientInfo: {
        patientName: "",
        doctorName: "",
        patientAge: "",
        gender: "",
        patientId: "",
      },
      medicines: [{ name: "", duration: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

  const auth = getAuth(); // Initialize Firebase Auth
  const navigate = useNavigate(); // Initialize React Router navigation

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (web3Service.isConnected()) {
      const account = web3Service.getCurrentAccount();
      setWalletAddress(account);
      setWalletConnected(true);
      
      // Check if doctor is authorized
      const isAuthorized = await web3Service.isDoctorAuthorized();
      setIsDoctorAuthorized(isAuthorized);
    }
  };

  const connectWallet = async () => {
    try {
      const account = await web3Service.connectWallet();
      setWalletAddress(account);
      setWalletConnected(true);
      
      // Check if doctor is authorized (gracefully handle if contract not deployed)
      try {
        const isAuthorized = await web3Service.isDoctorAuthorized();
        setIsDoctorAuthorized(isAuthorized);
        
        if (!isAuthorized) {
          console.log("Wallet connected but not authorized as doctor in smart contract");
          console.log("This is normal if the smart contract is not deployed yet");
        }
      } catch (authError) {
        console.log("Authorization check failed - contract may not be deployed:", authError.message);
        setIsDoctorAuthorized(false);
      }
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    setIsGenerating(true);
    setSuccessMessage("");

    try {
      // Validate prescription data
      PrescriptionService.validatePrescriptionData(data);

      // Create prescription object with metadata
      const prescriptionData = PrescriptionService.createPrescriptionObject(data, walletAddress || "demo-doctor");

      // Generate QR code and hash
      const { qrCodeDataURL, hash } = await PrescriptionService.generateQRCode(prescriptionData);

      // Store prescription data in Firestore
      const docRef = await addDoc(collection(db, "prescriptions"), {
        ...prescriptionData,
        prescriptionHash: hash,
        qrCodeDataURL: qrCodeDataURL
      });

      // Store hash on blockchain only if wallet is connected and authorized
      if (walletConnected && isDoctorAuthorized) {
        try {
          await web3Service.createPrescription(hash, walletAddress);
          setSuccessMessage(`Prescription created successfully and stored on blockchain! Hash: ${hash}`);
        } catch (blockchainError) {
          console.error("Blockchain error:", blockchainError);
          setSuccessMessage(`Prescription created successfully! Hash: ${hash} (Blockchain storage failed - check wallet connection)`);
        }
      } else {
        setSuccessMessage(`Prescription created successfully! Hash: ${hash} (Connect wallet for blockchain storage)`);
      }

      setQrCodeData({
        qrCodeDataURL,
        hash,
        prescriptionId: docRef.id
      });
      
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert(`Failed to create prescription: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/"); // Navigate to the home page
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Wallet Connection and Logout */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {isDoctorAuthorized && (
                  <span className="text-xs bg-green-200 px-2 py-1 rounded">Authorized Doctor</span>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Wallet Status Info */}
        {!walletConnected && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Connect your wallet to enable blockchain storage of prescription hashes. 
              You can still create prescriptions without wallet connection - they will be stored in the database.
            </p>
          </div>
        )}

        {/* Wallet Connected but Not Authorized */}
        {walletConnected && !isDoctorAuthorized && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <p className="text-sm">
              <strong>Wallet Connected:</strong> Your wallet is connected but not authorized in the smart contract. 
              This is normal if the contract isn't deployed yet. You can still create prescriptions - they'll be stored in the database.
            </p>
          </div>
        )}

        {/* QR Code Display */}
        {qrCodeData && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <QrCode className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Generated QR Code</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <img 
                  src={qrCodeData.qrCodeDataURL} 
                  alt="Prescription QR Code" 
                  className="w-48 h-48 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Prescription Hash:</strong> {qrCodeData.hash}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Prescription ID:</strong> {qrCodeData.prescriptionId}
                  </p>
                  <p className="text-xs text-gray-500">
                    This QR code contains encrypted prescription data and can be scanned by patients or pharmacists for verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Prescription
          </h1>
          <p className="text-gray-600">
            Create a detailed prescription for your patient
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Patient and Doctor Information */}
              <div className="bg-blue-50 rounded-xl p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Patient Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      {...register("patientInfo.patientId")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter Patient ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      {...register("patientInfo.patientName")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter Patient Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      {...register("patientInfo.doctorName")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter Doctor Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      {...register("patientInfo.patientAge")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Enter Age"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      {...register("patientInfo.gender")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medicines Section */}
              <div className="bg-indigo-50 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pills className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Prescribed Medicines
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ name: "", duration: "" })}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-grow space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-grow">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medicine Name
                              </label>
                              <Controller
                                control={control}
                                name={`medicines[${index}].name`}
                                render={({ field }) => (
                                  <input
                                    type="text"
                                    placeholder="Enter medicine name"
                                    {...field}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                  />
                                )}
                              />
                            </div>
                            <div className="flex-grow">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                              </label>
                              <Controller
                                control={control}
                                name={`medicines[${index}].duration`}
                                render={({ field }) => (
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="e.g., 7 days"
                                      {...field}
                                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    />
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isGenerating ? 'Generating Prescription...' : 'Generate Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;