// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PrescriptionVerification {
    struct Prescription {
        string prescriptionHash;
        address doctorAddress;
        address patientAddress;
        uint256 timestamp;
        bool isValid;
        bool isUsed;
    }

    mapping(string => Prescription) public prescriptions;
    mapping(address => bool) public authorizedDoctors;
    mapping(address => bool) public authorizedPharmacists;
    
    address public owner;
    uint256 public prescriptionCount;

    event PrescriptionCreated(
        string indexed prescriptionHash,
        address indexed doctorAddress,
        address indexed patientAddress,
        uint256 timestamp
    );

    event PrescriptionVerified(
        string indexed prescriptionHash,
        address indexed pharmacistAddress,
        bool isValid
    );

    event PrescriptionUsed(
        string indexed prescriptionHash,
        address indexed pharmacistAddress
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Only authorized doctors can call this function");
        _;
    }

    modifier onlyAuthorizedPharmacist() {
        require(authorizedPharmacists[msg.sender], "Only authorized pharmacists can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addAuthorizedDoctor(address doctorAddress) external onlyOwner {
        authorizedDoctors[doctorAddress] = true;
    }

    function addAuthorizedPharmacist(address pharmacistAddress) external onlyOwner {
        authorizedPharmacists[pharmacistAddress] = true;
    }

    function removeAuthorizedDoctor(address doctorAddress) external onlyOwner {
        authorizedDoctors[doctorAddress] = false;
    }

    function removeAuthorizedPharmacist(address pharmacistAddress) external onlyOwner {
        authorizedPharmacists[pharmacistAddress] = false;
    }

    function createPrescription(
        string memory prescriptionHash,
        address patientAddress
    ) external onlyAuthorizedDoctor {
        require(bytes(prescriptionHash).length > 0, "Prescription hash cannot be empty");
        require(patientAddress != address(0), "Patient address cannot be zero address");
        require(!prescriptions[prescriptionHash].isValid, "Prescription already exists");

        prescriptions[prescriptionHash] = Prescription({
            prescriptionHash: prescriptionHash,
            doctorAddress: msg.sender,
            patientAddress: patientAddress,
            timestamp: block.timestamp,
            isValid: true,
            isUsed: false
        });

        prescriptionCount++;
        
        emit PrescriptionCreated(
            prescriptionHash,
            msg.sender,
            patientAddress,
            block.timestamp
        );
    }

    function verifyPrescription(string memory prescriptionHash) 
        external 
        view 
        returns (
            bool isValid,
            address doctorAddress,
            address patientAddress,
            uint256 timestamp,
            bool isUsed
        ) 
    {
        Prescription memory prescription = prescriptions[prescriptionHash];
        return (
            prescription.isValid,
            prescription.doctorAddress,
            prescription.patientAddress,
            prescription.timestamp,
            prescription.isUsed
        );
    }

    function usePrescription(string memory prescriptionHash) 
        external 
        onlyAuthorizedPharmacist 
    {
        require(prescriptions[prescriptionHash].isValid, "Prescription does not exist or is invalid");
        require(!prescriptions[prescriptionHash].isUsed, "Prescription has already been used");

        prescriptions[prescriptionHash].isUsed = true;
        
        emit PrescriptionUsed(prescriptionHash, msg.sender);
    }

    function invalidatePrescription(string memory prescriptionHash) 
        external 
        onlyAuthorizedDoctor 
    {
        require(prescriptions[prescriptionHash].isValid, "Prescription does not exist or is already invalid");
        require(
            prescriptions[prescriptionHash].doctorAddress == msg.sender,
            "Only the prescribing doctor can invalidate this prescription"
        );

        prescriptions[prescriptionHash].isValid = false;
    }

    function getPrescriptionCount() external view returns (uint256) {
        return prescriptionCount;
    }

    function isDoctorAuthorized(address doctorAddress) external view returns (bool) {
        return authorizedDoctors[doctorAddress];
    }

    function isPharmacistAuthorized(address pharmacistAddress) external view returns (bool) {
        return authorizedPharmacists[pharmacistAddress];
    }
}
