# 🧪 Fake Prescription Detection - Testing Guide

## 🎯 How to Test Fake Detection

Follow these steps to test if your system properly detects fake prescriptions.

---

## 🧪 **TEST 1: Valid Prescription (Should Work ✅)**

### Step-by-Step:
1. **Login as Doctor**
   - Go to http://localhost:5175
   - Click "Doctor" → Sign In
   - Connect wallet (optional)

2. **Create Prescription**
   - Fill form with:
     - Patient ID: `TEST-001`
     - Patient Name: `John Doe`
     - Doctor Name: `Dr. Smith`
     - Patient Age: `30`
     - Gender: `Male`
     - Medicine: `Paracetamol`
     - Duration: `7 days`

3. **Generate QR Code**
   - Click "Generate Prescription"
   - ✅ You get valid QR code
   - Screenshot this QR code

4. **Test as Pharmacist**
   - Login as Pharmacist
   - Upload QR code
   - ✅ Should show: "Prescription Verified"

**Expected Result:** ✅ **VALID** - All data shows correctly

---

## 🧪 **TEST 2: Fake QR Code (Should Fail ❌)**

### Method A: Random QR Code
1. **Create fake QR code:**
   - Go to any QR code generator online
   - Enter random text: `"This is fake prescription data"`
   - Generate QR code

2. **Try to scan:**
   - Login as Pharmacist
   - Upload fake QR code

3. **Expected Result:**
   ```
   ❌ Verification Failed
   Error: Error decrypting prescription data
   or
   Error: Invalid encrypted data
   ```

### Method B: Wrong Format Data
1. **Create QR with wrong format:**
   - Use QR generator
   - Put data: `{"fake": "data"}`
   - Generate QR

2. **Try to scan:**
   - Upload to pharmacist dashboard

3. **Expected Result:**
   ```
   ❌ Verification Failed
   Error: Missing required field: patientInfo
   or
   Error: Missing required field: medicines
   ```

---

## 🧪 **TEST 3: Tampered Prescription Data (Should Fail ❌)**

### How to Test:
1. **Get Valid QR Code**
   - Create valid prescription as Doctor
   - Screenshot QR code

2. **Modify the Data (Testing Only):**
   - In browser console, you could try to modify encrypted data
   - OR create a new QR code with different data but same structure

3. **Try to Scan Modified QR**

4. **Expected Result:**
   ```
   ❌ Verification Failed
   Error: Hash mismatch detected
   or
   Error: Invalid prescription data
   ```

---

## 🧪 **TEST 4: Reused Prescription (Should Detect ❌)**

### How to Test:
1. **Create Valid Prescription**
   - As Doctor, create and generate QR

2. **Use QR Code First Time**
   - As Pharmacist, scan QR
   - ✅ Should verify successfully
   - **Mark as Used**

3. **Try to Use Same QR Again**
   - Scan SAME QR code again
   - Expected Result:
   ```
   ❌ Verification Failed
   Status: Already Used
   Error: This prescription has already been used
   ```

---

## 🧪 **TEST 5: Test Different Fake Scenarios**

### Scenario A: Empty QR Code
1. Generate empty QR code
2. Try to scan
3. **Expected:** ❌ "No data in QR code"

### Scenario B: Corrupted QR Code
1. Take screenshot of valid QR
2. Blur or corrupt the image
3. Try to scan
4. **Expected:** ❌ "Could not scan QR code from this image"

### Scenario C: Wrong Encryption Key
1. Your system uses specific encryption key
2. QR code encrypted with different key won't decrypt
3. **Expected:** ❌ "Decryption failed"

---

## 📝 **Quick Testing Checklist**

### ✅ **Valid Prescription Test:**
```
□ Create prescription as Doctor
□ Generate QR code
□ Login as Pharmacist  
□ Upload QR
□ Should show: "Prescription Verified" ✅
```

### ❌ **Fake QR Test:**
```
□ Create random text QR code
□ Try to upload as Pharmacist
□ Should show: "Verification Failed" ❌
□ Error message displayed
```

### ❌ **Reused QR Test:**
```
□ Use prescription once
□ Mark as Used
□ Try to use same QR again
□ Should show: "Already Used" ❌
□ Cannot mark as used twice
```

### ❌ **Corrupted Data Test:**
```
□ Modify prescription data structure
□ Try to scan
□ Should show: "Missing required field" ❌
```

---

## 🎯 **What You'll See in Different Scenarios**

### **✅ VALID Prescription:**
```
Prescription Verified
Status: Valid
Doctor: Dr. Smith
Patient: John Doe
Medicines: Paracetamol - 7 days
Timestamp: [current time]
Hash: abc123...
```

### **❌ FAKE QR Code:**
```
Verification Failed
Error: Error decrypting prescription data
Status: Invalid
Action: Cannot dispense medicines
```

### **❌ ALREADY USED:**
```
Prescription Verified
Status: Already Used
Doctor: Dr. Smith
Timestamp: [used time]
Error: This prescription cannot be used again
Action: REJECT - Requires new prescription
```

### **❌ TAMPERED DATA:**
```
Verification Failed
Status: Hash mismatch detected
Expected Hash: abc123...
Received Hash: xyz789...
Error: Data has been modified
Action: REJECT - Possible tampering detected
```

---

## 🔧 **Manual Testing Tools**

### **1. QR Code Generator (for fake testing):**
- https://www.qr-code-generator.com/
- Enter fake data
- Generate QR
- Try to scan in your app

### **2. Browser Console (advanced):**
- Open browser DevTools (F12)
- Check console for error messages
- See detailed verification logs

### **3. Test Different Data:**
```javascript
// Valid format:
{
  patientInfo: { name, doctor, age, gender },
  medicines: [{ name, duration }]
}

// Fake format 1 (missing fields):
{ patientInfo: { name: "Test" } }

// Fake format 2 (wrong structure):
{ data: "random stuff" }

// Fake format 3 (empty):
{}
```

---

## 🚀 **Quick Start Testing**

### **Test in 5 Minutes:**

1. **Valid Test (2 minutes):**
   - Login as Doctor → Create → Get QR
   - Login as Pharmacist → Scan QR
   - ✅ Should verify

2. **Fake Test (2 minutes):**
   - Generate random QR online
   - Upload to Pharmacist
   - ❌ Should fail

3. **Reuse Test (1 minute):**
   - Use valid QR twice
   - ❌ Should detect already used

---

## 📊 **Expected Test Results Summary**

| Test | Action | Expected Result |
|------|--------|----------------|
| Valid QR | Scan | ✅ Verified |
| Fake QR | Scan random QR | ❌ Failed - Wrong format |
| Reused QR | Scan twice | ❌ Already Used |
| Tampered QR | Modified data | ❌ Hash Mismatch |
| Empty QR | No data | ❌ No Data Error |
| Corrupted QR | Blurred image | ❌ Scan Failed |

---

## 🎯 **Pro Tips for Testing**

1. **Start with valid prescription** to establish baseline
2. **Test one fake scenario at a time**
3. **Check console logs** for detailed errors
4. **Document what you see** for each test
5. **Try both camera and file upload** methods

---

**Ready to test?** Start with the Valid Prescription test first, then try the Fake QR test to see how your system detects fraud! 🕵️‍♀️
