# 🔗 Wallet Connection Guide

## Quick Setup for Testing

### Option 1: Connect Any Wallet (Demo Mode)
1. **Install MetaMask** (if not already installed)
   - Chrome: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/

2. **Click "Connect Wallet"** in the app
3. **Approve the connection** in MetaMask popup
4. **Done!** You can now create prescriptions with blockchain features

### Option 2: Full Mumbai Testnet Setup (Advanced)

#### Step 1: Get Test MATIC Tokens
1. Go to https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Enter your wallet address
4. Request test MATIC tokens

#### Step 2: Switch to Mumbai Network
1. Open MetaMask
2. Click network dropdown (top of MetaMask)
3. Select "Polygon Mumbai" or add it manually:
   - Network Name: Polygon Mumbai
   - RPC URL: https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com/

#### Step 3: Deploy Smart Contract (Optional)
1. Use Remix IDE: https://remix.ethereum.org/
2. Deploy the contract from `contracts/PrescriptionVerification.sol`
3. Update contract address in `src/services/web3Service.js`

## Troubleshooting

### Common Issues:

**"MetaMask is not installed"**
- Install MetaMask browser extension
- Refresh the page after installation

**"Connection rejected"**
- Click "Connect" in MetaMask popup
- Make sure MetaMask is unlocked

**"No accounts found"**
- Unlock MetaMask
- Make sure you have at least one account

**"Wrong network"**
- The app works with any network for demo purposes
- For full features, switch to Mumbai testnet

**"Contract not found"**
- This is normal if contract isn't deployed yet
- App will work in demo mode without blockchain storage

## What Happens When Connected?

✅ **With Wallet Connected:**
- Prescriptions stored in database + blockchain
- Full verification capabilities
- Tamper-proof hash storage

⚠️ **Without Wallet:**
- Prescriptions stored in database only
- QR codes still work
- Limited blockchain features

## Need Help?

1. Check browser console for error messages
2. Ensure MetaMask is updated to latest version
3. Try refreshing the page
4. Check MetaMask transaction history

---

**Ready to connect?** Click the "Connect Wallet" button in the app!
