# Blockchain Prescription Verification System

A comprehensive blockchain-based prescription verification system that leverages smart contracts, QR code authentication, and decentralized validation to combat prescription fraud in healthcare.

## 🚀 Features

### ✅ Fully Implemented
- **Doctor Dashboard**: Create prescriptions, generate QR codes, store hashes on blockchain
- **Pharmacy Dashboard**: Scan QR codes, verify prescriptions on blockchain, mark as used
- **Patient Dashboard**: Scan QR codes, view prescription details, optional blockchain verification
- **MetaMask Integration**: Wallet-based authentication and blockchain interactions
- **Data Encryption**: Prescription data encrypted before QR code generation
- **Smart Contract**: Solidity contract for tamper-proof prescription verification
- **Role-based Access**: Authorized doctors and pharmacists only

### 🔧 Technology Stack
- **Frontend**: React.js + Tailwind CSS
- **Backend**: Firebase Firestore + Authentication
- **Blockchain**: Ethereum/Polygon Mumbai testnet
- **Smart Contract**: Solidity
- **Web3**: Ethers.js for blockchain interactions
- **QR Codes**: Encrypted prescription data with blockchain verification

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Firebase project
- Mumbai testnet MATIC tokens

### Installation
```bash
npm install
npm run dev
```

### Setup
1. Configure Firebase in `firebaseConfig.js`
2. Deploy smart contract to Mumbai testnet
3. Update contract address in `src/services/web3Service.js`
4. Authorize doctors/pharmacists in smart contract

## 📋 Usage Flow

### Doctor Creates Prescription
1. Connect MetaMask wallet
2. Fill prescription form
3. System generates encrypted QR code
4. Prescription hash stored on blockchain

### Pharmacist Verifies Prescription
1. Connect MetaMask wallet
2. Scan QR code (camera/file)
3. System verifies on blockchain
4. Shows prescription details
5. Can mark prescription as used

### Patient Views Prescription
1. Scan QR code
2. View prescription details
3. Optional blockchain verification

## 🔒 Security Features

- **Tamper-proof**: Prescription hashes stored on immutable blockchain
- **Encrypted Data**: All prescription data encrypted before QR generation
- **Role Verification**: Only authorized users can perform actions
- **One-time Use**: Prescriptions can be marked as used
- **Decentralized**: No single point of failure

## 📁 Project Structure

```
src/
├── components/
│   ├── DoctorDashBoard.jsx      # Doctor prescription creation
│   ├── PharmacyDash.jsx         # Pharmacist verification
│   ├── PatientDashBoard.jsx     # Patient prescription viewing
│   └── ...
├── services/
│   ├── web3Service.js          # Blockchain interactions
│   └── prescriptionService.js   # Encryption/QR generation
└── contracts/
    └── PrescriptionVerification.sol  # Smart contract
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup and deployment instructions.

## 🧪 Testing

### Test Scenarios
- Doctor creates prescription → Generate QR → Verify blockchain
- Pharmacist scans QR → Verify blockchain → Mark as used
- Patient scans QR → View details → Optional verification
- Security: Modify QR data → Verify tamper detection

### Test Tokens
Get Mumbai testnet MATIC from: https://faucet.polygon.technology/

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify MetaMask connection
3. Check Firebase console
4. Review Mumbai testnet transactions

## 🎯 Benefits

- **Transparency**: All prescription data verifiable on blockchain
- **Security**: Tamper-proof verification system
- **Privacy**: Encrypted data with blockchain verification
- **Efficiency**: Quick QR code scanning and verification
- **Trust**: Decentralized validation reduces fraud

---

**Status**: ✅ Fully Functional Prototype Ready for Testing
