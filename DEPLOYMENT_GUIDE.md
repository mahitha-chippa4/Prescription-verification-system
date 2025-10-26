# Blockchain Prescription Verification System - Deployment Guide

## Overview
This is a fully functional blockchain-based prescription verification system that uses:
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Firebase Firestore
- **Blockchain**: Ethereum/Polygon Mumbai testnet
- **Smart Contract**: Solidity contract for prescription verification
- **Authentication**: Firebase Auth + MetaMask wallet integration

## Features Implemented ✅

### Core Functionality
- ✅ Doctor dashboard with prescription creation
- ✅ QR code generation with encrypted prescription data
- ✅ Blockchain hash storage for prescription verification
- ✅ Pharmacy dashboard with QR scanning and blockchain verification
- ✅ Patient dashboard for viewing prescription details
- ✅ MetaMask wallet integration
- ✅ Prescription data encryption/decryption
- ✅ Role-based access control

### User Roles
- **Doctors**: Create prescriptions, generate QR codes, store hashes on blockchain
- **Pharmacists**: Scan QR codes, verify prescriptions on blockchain, mark as used
- **Patients**: Scan QR codes, view prescription details, optional blockchain verification

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Update `firebaseConfig.js` with your Firebase project credentials
2. Enable Firestore in Firebase console
3. Set up Firebase Authentication

### 3. Deploy Smart Contract
1. Install Hardhat or Remix IDE
2. Deploy `contracts/PrescriptionVerification.sol` to Mumbai testnet
3. Update `CONTRACT_ADDRESS` in `src/services/web3Service.js`
4. Update `MUMBAI_RPC_URL` with your Infura/Alchemy endpoint

### 4. Configure Web3 Service
Update `src/services/web3Service.js`:
```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const MUMBAI_RPC_URL = "YOUR_INFURA_OR_ALCHEMY_ENDPOINT";
```

### 5. Authorize Users
After deploying the contract, authorize doctors and pharmacists:
```javascript
// Call these functions on the deployed contract
await contract.addAuthorizedDoctor("DOCTOR_WALLET_ADDRESS");
await contract.addAuthorizedPharmacist("PHARMACIST_WALLET_ADDRESS");
```

## Running the Application

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Usage Flow

### 1. Doctor Creates Prescription
1. Doctor connects MetaMask wallet
2. Fills prescription form with patient and medicine details
3. System generates encrypted QR code and blockchain hash
4. Prescription data stored in Firestore
5. Hash stored on blockchain via smart contract

### 2. Pharmacist Verifies Prescription
1. Pharmacist connects MetaMask wallet
2. Scans QR code (camera or file upload)
3. System decrypts prescription data
4. Verifies hash on blockchain
5. Shows prescription details and verification status
6. Can mark prescription as used

### 3. Patient Views Prescription
1. Patient scans QR code
2. System decrypts and displays prescription details
3. Optional blockchain verification if wallet connected

## Security Features

- **Data Encryption**: All prescription data encrypted before QR code generation
- **Blockchain Verification**: Prescription hashes stored on immutable blockchain
- **Role-based Access**: Only authorized doctors/pharmacists can perform actions
- **Tamper Detection**: Any modification to prescription data invalidates verification
- **One-time Use**: Prescriptions can be marked as used to prevent reuse

## Testing

### Test Scenarios
1. **Doctor Flow**: Create prescription → Generate QR → Verify on blockchain
2. **Pharmacist Flow**: Scan QR → Verify blockchain → Mark as used
3. **Patient Flow**: Scan QR → View details → Optional verification
4. **Security**: Try modifying QR data → Verify tamper detection

### Test Data
Use Mumbai testnet MATIC tokens for gas fees. Get test tokens from:
- Mumbai Faucet: https://faucet.polygon.technology/

## Troubleshooting

### Common Issues
1. **MetaMask not connecting**: Ensure MetaMask is installed and unlocked
2. **Contract not found**: Verify contract address and network (Mumbai)
3. **Authorization failed**: Ensure user is authorized in smart contract
4. **QR scan fails**: Check if QR code is valid prescription data

### Network Issues
- Ensure you're on Mumbai testnet (Chain ID: 80001)
- Check RPC endpoint is working
- Verify contract is deployed and accessible

## Production Considerations

### Security
- Use environment variables for sensitive data
- Implement proper key management for encryption
- Add rate limiting and input validation
- Consider using IPFS for larger prescription data

### Scalability
- Implement caching for blockchain queries
- Consider layer 2 solutions for lower gas costs
- Add database indexing for faster queries

### Monitoring
- Add logging for all blockchain transactions
- Implement error tracking and monitoring
- Set up alerts for failed verifications

## File Structure
```
src/
├── components/
│   ├── DoctorDashBoard.jsx      # Doctor prescription creation
│   ├── PharmacyDash.jsx        # Pharmacist verification
│   ├── PatientDashBoard.jsx    # Patient prescription viewing
│   └── ...
├── services/
│   ├── web3Service.js          # Blockchain interactions
│   └── prescriptionService.js   # Encryption/QR generation
└── contracts/
    └── PrescriptionVerification.sol  # Smart contract
```

## Support
For issues or questions, check:
1. Console logs for error messages
2. MetaMask transaction history
3. Firebase console for data issues
4. Mumbai testnet explorer for contract interactions
