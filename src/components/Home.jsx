import React from "react";
import { Stethoscope, User, Pill as Pills, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const userTypes = [
    {
      type: "Doctor",
      icon: Stethoscope,
      description: "Issue digital prescriptions",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "group-hover:border-blue-500/50"
    },
    {
      type: "Patient",
      icon: User,
      description: "View and manage history",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "group-hover:border-emerald-500/50"
    },
    {
      type: "Pharmacist",
      icon: Pills,
      description: "Verify and dispense",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "group-hover:border-purple-500/50"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mr-2" />
            <span className="text-emerald-300 font-medium">Secure Blockchain Verification</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
              Prescription Verification
            </span>
            <br />
            <span className="text-slate-100">System</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A decentralized platform ensuring authencity and trust in healthcare using blockchain technology.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {userTypes.map((userType, index) => (
            <button
              key={userType.type}
              onClick={() => navigate(`/${userType.type}`)}
              className="group relative p-8 rounded-3xl glass-panel text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/20"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`absolute inset-0 rounded-3xl border border-white/5 ${userType.border} transition-colors duration-300`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${userType.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                  <userType.icon className={`w-7 h-7 ${userType.color}`} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                  {userType.type}
                </h2>
                
                <p className="text-slate-400 mb-6 group-hover:text-slate-300 transition-colors">
                  {userType.description}
                </p>
                
                <div className="flex items-center text-sm font-semibold text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer/Trust Indicators */}
        <div className="mt-20 text-center border-t border-white/5 pt-8">
          <p className="text-slate-500 text-sm">
            Powered by Ethereum Secure Smart Contracts
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
