import { ethers } from 'ethers';

// Contract ABI - This would be generated after compiling the smart contract
//Solidity is the programming language used to write smart contracts (small programs that live on the blockchain)
//This is like a mini database on the blockchain that ensures:
//Hashes are stored immutably.
//Once marked as used → can’t be reused.
//Solidity = Code that defines the logic on blockchain.
const CONTRACT_ABI = [
  "function createPrescription(string memory prescriptionHash, address patientAddress) external",
  "function verifyPrescription(string memory prescriptionHash) external view returns (bool isValid, address doctorAddress, address patientAddress, uint256 timestamp, bool isUsed)",
  "function usePrescription(string memory prescriptionHash) external",
  "function addAuthorizedDoctor(address doctorAddress) external",
  "function addAuthorizedPharmacist(address pharmacistAddress) external",
  "function isDoctorAuthorized(address doctorAddress) external view returns (bool)",
  "function isPharmacistAuthorized(address pharmacistAddress) external view returns (bool)",
  "event PrescriptionCreated(string indexed prescriptionHash, address indexed doctorAddress, address indexed patientAddress, uint256 timestamp)",
  "event PrescriptionVerified(string indexed prescriptionHash, address indexed pharmacistAddress, bool isValid)",
  "event PrescriptionUsed(string indexed prescriptionHash, address indexed pharmacistAddress)"
];

// Contract address - This would be the deployed contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

// Network configurations
const NETWORKS = {
  // Mumbai testnet configuration
  mumbai: {
    chainId: 80001,
    chainName: 'Polygon Mumbai',
    rpcUrls: ['https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    }
  },
  // Ethereum mainnet (for production)
  ethereum: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
    blockExplorerUrls: ['https://etherscan.io/'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    }
  },
  // Local development
  localhost: {
    chainId: 31337,
    chainName: 'Localhost',
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    }
  }
};

// Default network (change this to switch between testnet/mainnet)
const DEFAULT_NETWORK = 'mumbai';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      this.account = accounts[0];
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check current network and provide guidance
      const currentNetwork = await this.getCurrentNetwork();
      const targetNetwork = NETWORKS[DEFAULT_NETWORK];
      
      if (currentNetwork.chainId !== targetNetwork.chainId) {
        console.log(`Current network: ${currentNetwork.name} (${currentNetwork.chainId})`);
        console.log(`Target network: ${targetNetwork.chainName} (${targetNetwork.chainId})`);
        
        // For demo purposes, we'll work with any network
        // In production, you'd want to switch to the correct network
        console.log('Working with current network for demo purposes');
      }

      // Initialize contract only if contract address is set
      if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );
      } else {
        console.log('Contract address not set - blockchain features will be limited');
      }

      return this.account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Provide more helpful error messages
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check MetaMask.');
      } else {
        throw new Error(`Failed to connect wallet: ${error.message}`);
      }
    }
  }

  // Get current network information
  async getCurrentNetwork() {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name || 'Unknown Network'
      };
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  // Check if we're on the correct network
  async checkNetwork() {
    if (!this.provider) return;

    const currentNetwork = await this.getCurrentNetwork();
    const targetNetwork = NETWORKS[DEFAULT_NETWORK];
    
    if (!currentNetwork || currentNetwork.chainId !== targetNetwork.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
        });
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          await this.addNetwork(targetNetwork);
        } else {
          throw switchError;
        }
      }
    }
  }

  // Add network to MetaMask
  async addNetwork(networkConfig) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${networkConfig.chainId.toString(16)}`,
          chainName: networkConfig.chainName,
          nativeCurrency: networkConfig.nativeCurrency,
          rpcUrls: networkConfig.rpcUrls,
          blockExplorerUrls: networkConfig.blockExplorerUrls,
        },
      ],
    });
  }

  // Get current account
  getCurrentAccount() {
    return this.account;
  }

  // Check if user is connected
  isConnected() {
    return this.account !== null && this.contract !== null;
  }

  // Create a prescription on the blockchain
  async createPrescription(prescriptionHash, patientAddress) {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      const tx = await this.contract.createPrescription(prescriptionHash, patientAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  // Verify a prescription
  async verifyPrescription(prescriptionHash) {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      const result = await this.contract.verifyPrescription(prescriptionHash);
      return {
        isValid: result[0],
        doctorAddress: result[1],
        patientAddress: result[2],
        timestamp: result[3],
        isUsed: result[4]
      };
    } catch (error) {
      console.error('Error verifying prescription:', error);
      throw error;
    }
  }

  // Mark prescription as used
  async usePrescription(prescriptionHash) {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please connect wallet first.');
    }

    try {
      const tx = await this.contract.usePrescription(prescriptionHash);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error using prescription:', error);
      throw error;
    }
  }

  // Check if current user is authorized doctor
  async isDoctorAuthorized() {
    if (!this.contract || !this.account) {
      console.log('Contract not initialized or no account connected');
      return false;
    }

    try {
      return await this.contract.isDoctorAuthorized(this.account);
    } catch (error) {
      console.error('Error checking doctor authorization:', error);
      // If contract call fails, it might be because contract isn't deployed
      if (error.message.includes('contract') || error.message.includes('call')) {
        console.log('Contract may not be deployed yet - authorization check failed');
      }
      return false;
    }
  }

  // Check if current user is authorized pharmacist
  async isPharmacistAuthorized() {
    if (!this.contract || !this.account) {
      console.log('Contract not initialized or no account connected');
      return false;
    }

    try {
      return await this.contract.isPharmacistAuthorized(this.account);
    } catch (error) {
      console.error('Error checking pharmacist authorization:', error);
      // If contract call fails, it might be because contract isn't deployed
      if (error.message.includes('contract') || error.message.includes('call')) {
        console.log('Contract may not be deployed yet - authorization check failed');
      }
      return false;
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // Listen for account changes
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for network changes
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

// Create a singleton instance
const web3Service = new Web3Service();

export default web3Service;
