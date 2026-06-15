import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Minus, Stethoscope, User, Clock, Pill as Pills, LogOut, Wallet, QrCode, CheckCircle, FileText } from "lucide-react";
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Stethoscope className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Doctor Portal</h1>
              <p className="text-slate-400 text-sm">Issue blockchain-verified prescriptions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {isDoctorAuthorized && (
                  <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
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

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl animate-fade-in flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {!walletConnected && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl flex items-center gap-3">
            <Wallet className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Connect your wallet to enable immutable blockchain storage for prescriptions.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Form */}
          <div className="glass-panel p-8 rounded-2xl lg:col-span-2">
            <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-100">Prescription Details</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Patient Info Group */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Patient Information</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Patient ID</label>
                    <input
                      type="text"
                      {...register("patientInfo.patientId")}
                      className="w-full px-4 py-3 rounded-xl glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="P-123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Patient Name</label>
                    <input
                      type="text"
                      {...register("patientInfo.patientName")}
                      className="w-full px-4 py-3 rounded-xl glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Doctor Name</label>
                    <input
                      type="text"
                      {...register("patientInfo.doctorName")}
                      className="w-full px-4 py-3 rounded-xl glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-400">Age</label>
                      <input
                        type="number"
                        {...register("patientInfo.patientAge")}
                        className="w-full px-4 py-3 rounded-xl glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-400">Gender</label>
                      <select
                        {...register("patientInfo.gender")}
                        className="w-full px-4 py-3 rounded-xl glass-input outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-slate-900"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medicines Group */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Pills className="h-4 w-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Prescribed Medicines</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ name: "", duration: "" })}
                    className="flex items-center space-x-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-500">Medicine Name</label>
                            <Controller
                              control={control}
                              name={`medicines[${index}].name`}
                              render={({ field }) => (
                                <input
                                  type="text"
                                  placeholder="e.g. Amoxicillin 500mg"
                                  {...field}
                                  className="w-full px-4 py-2.5 rounded-lg glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-500">Duration & Dosage</label>
                            <Controller
                              control={control}
                              name={`medicines[${index}].duration`}
                              render={({ field }) => (
                                <div className="relative">
                                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                  <input
                                    type="text"
                                    placeholder="e.g. 7 days, 2x daily"
                                    {...field}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input outline-none focus:ring-2 focus:ring-blue-500/50"
                                  />
                                </div>
                              )}
                            />
                          </div>
                        </div>

                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors border border-red-500/20"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`btn-primary px-8 py-3 rounded-xl font-semibold text-lg hover:shadow-emerald-500/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isGenerating ? 'Securing on Blockchain...' : 'Generate Secure Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* QR Code Result Panel */}
        {qrCodeData && (
          <div className="glass-panel p-8 rounded-2xl animate-fade-in border-t-4 border-t-emerald-500">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">Prescription Generated Successfully</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-900/50 p-6 rounded-xl border border-white/5">
              <div className="p-4 bg-white rounded-xl shadow-lg shadow-black/20">
                <img
                  src={qrCodeData.qrCodeDataURL}
                  alt="Prescription QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prescription Hash</p>
                  <p className="font-mono text-sm text-emerald-300 break-all bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    {qrCodeData.hash}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prescription ID</p>
                  <p className="font-mono text-sm text-slate-300">
                    {qrCodeData.prescriptionId}
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-200 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    This QR code contains the encrypted prescription data. Patients can scan this to view details, and pharmacists can scan to verify and dispense.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;