const mongoose = require('mongoose');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicineRequest = require('../models/MedicineRequest');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const MediPointsTransaction = require('../models/MediPointsTransaction');

const seedData = async () => {
  try {
    // Clear existing
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await MedicineRequest.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await MediPointsTransaction.deleteMany({});

    console.log('[Seed] Cleared existing records (users, medicines, requests, notifications, audit logs, medipoints).');

    // 1. Create Demo Users with Distinct Roles:
    // Platform Administrator
    const adminUser = await User.create({
      name: 'MediCycle Admin',
      email: 'admin@medicycle.demo',
      password: 'password123',
      role: 'admin',
      mediPoints: 0,
    });

    // Chief / Lead Pharmacist (Dr. Anita Sharma)
    const pharmacistUser = await User.create({
      name: 'Dr. Anita Sharma (Lead Pharmacist)',
      email: 'pharmacist@medicycle.demo',
      password: 'password123',
      role: 'pharmacist',
      mediPoints: 0,
    });

    // Compatibility alias for existing sessions using admin@medicycle.org
    await User.create({
      name: 'Dr. Anita Sharma (Clinical Pharmacist)',
      email: 'admin@medicycle.org',
      password: 'password123',
      role: 'pharmacist',
      mediPoints: 0,
    });

    // Person A (Community User - Donor Journey)
    const donorUser = await User.create({
      name: 'Aarav Patel (Person A - Donor)',
      email: 'aarav@example.com',
      password: 'password123',
      role: 'user',
      mediPoints: 2400,
    });

    // Person B (Community User - Recipient Journey)
    const recipientUser = await User.create({
      name: 'Priya Verma (Person B - Recipient)',
      email: 'priya@example.com',
      password: 'password123',
      role: 'user',
      mediPoints: 1000,
    });

    console.log('[Seed] Created demo users (Admin, Pharmacist, Person A [2400 pts], Person B [1000 pts]).');

    // 2. Create Fictional Medicine Listings
    const futureDate1 = new Date();
    futureDate1.setMonth(futureDate1.getMonth() + 14);

    const futureDate2 = new Date();
    futureDate2.setMonth(futureDate2.getMonth() + 8);

    const futureDate3 = new Date();
    futureDate3.setMonth(futureDate3.getMonth() + 20);

    const futureDate4 = new Date();
    futureDate4.setMonth(futureDate4.getMonth() + 5);

    const futureDate5 = new Date();
    futureDate5.setMonth(futureDate5.getMonth() + 11);

    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 2);

    const medicines = [
      {
        name: 'Amoxicillin Trihydrate',
        genericName: 'Amoxicillin',
        strength: '500 mg',
        category: 'Antibiotics',
        quantity: 30,
        batchNumber: 'AMX-9821-B',
        expiryDate: futureDate1,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 240,
        affordablePrice: 45,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Leftover course after dental treatment, unopened manufacturer strip.',
        location: 'Indiranagar, Bengaluru',
      },
      {
        name: 'Metformin Hydrochloride',
        genericName: 'Metformin HCl',
        strength: '500 mg SR',
        category: 'Diabetes Care',
        quantity: 60,
        batchNumber: 'MET-4412-C',
        expiryDate: futureDate3,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Unopened Factory Sealed Box',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
        originalPrice: 180,
        affordablePrice: 35,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Doctor adjusted dosage; factory sealed strip intact.',
        location: 'Koramangala, Bengaluru',
      },
      {
        name: 'Paracetamol Tablets IP',
        genericName: 'Paracetamol',
        strength: '500 mg',
        category: 'Pain Relief',
        quantity: 40,
        batchNumber: 'PCM-2023-A',
        expiryDate: futureDate1,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 60,
        affordablePrice: 15,
        prescriptionRequired: false,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'General fever care surplus from corporate first-aid box.',
        location: 'HSR Layout, Bengaluru',
      },
      {
        name: 'Telmisartan Tablets IP',
        genericName: 'Telmisartan',
        strength: '40 mg',
        category: 'Cardiology',
        quantity: 28,
        batchNumber: 'TEL-8819-D',
        expiryDate: futureDate5,
        storageCondition: 'Cool & Dry Place (< 20°C)',
        packageCondition: 'Unopened Factory Sealed Box',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 210,
        affordablePrice: 40,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Long-term cardiovascular maintenance surplus.',
        location: 'Jayanagar, Bengaluru',
      },
      {
        name: 'Pantoprazole Gastro-Resistant',
        genericName: 'Pantoprazole Sodium',
        strength: '40 mg',
        category: 'Gastrointestinal',
        quantity: 20,
        batchNumber: 'PAN-1099-E',
        expiryDate: futureDate2,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
        originalPrice: 145,
        affordablePrice: 30,
        prescriptionRequired: false,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Sealed strip, unused portion of acid-reflux therapy.',
        location: 'Whitefield, Bengaluru',
      },
      {
        name: 'Cetirizine Hydrochloride',
        genericName: 'Cetirizine HCl',
        strength: '10 mg',
        category: 'Respiratory',
        quantity: 50,
        batchNumber: 'CET-6712-F',
        expiryDate: futureDate4,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 90,
        affordablePrice: 20,
        prescriptionRequired: false,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Seasonal allergy relief tablets in original sealed strip.',
        location: 'Malleshwaram, Bengaluru',
      },
      // EXPENSIVE MEDICINES AVAILABLE FOR SALE / REDISTRIBUTION (High-Value Critical Therapies)
      {
        name: 'Imatinib Mesylate Tablets IP',
        genericName: 'Imatinib Mesylate',
        strength: '400 mg',
        category: 'Oncology',
        quantity: 30,
        batchNumber: 'IMT-9921-ONC',
        expiryDate: futureDate1,
        storageCondition: 'Cool & Dry Place (< 25°C)',
        packageCondition: 'Unopened Factory Sealed Box',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 18500,
        affordablePrice: 1200,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Full unopened month supply surplus after protocol adjustment. Tamper-evident seal verified.',
        location: 'Koramangala, Bengaluru',
      },
      {
        name: 'Eliquis (Apixaban Tablets)',
        genericName: 'Apixaban',
        strength: '5 mg',
        category: 'Cardiology',
        quantity: 60,
        batchNumber: 'APX-4421-B',
        expiryDate: futureDate3,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 3850,
        affordablePrice: 380,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Vital post-cardiac surgery blood thinner surplus in original unopened blister strips.',
        location: 'Indiranagar, Bengaluru',
      },
      {
        name: 'Prograf (Tacrolimus Capsules)',
        genericName: 'Tacrolimus',
        strength: '1 mg',
        category: 'Critical Care',
        quantity: 50,
        batchNumber: 'TAC-8812-TX',
        expiryDate: futureDate5,
        storageCondition: 'Store below 25°C, Protect from Moisture',
        packageCondition: 'Unopened Manufacturer Blister Strips',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
        originalPrice: 4800,
        affordablePrice: 450,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Organ transplant anti-rejection therapy. Strict clinical inspection passed.',
        location: 'Jayanagar, Bengaluru',
      },
      {
        name: 'Rybelsus (Semaglutide Tablets)',
        genericName: 'Semaglutide',
        strength: '7 mg',
        category: 'Diabetes Care',
        quantity: 30,
        batchNumber: 'GLP-7701-DK',
        expiryDate: futureDate1,
        storageCondition: 'Store in Original Blister Pack',
        packageCondition: 'Unopened Factory Sealed Box',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 3900,
        affordablePrice: 420,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Advanced GLP-1 diabetes treatment. Unopened factory box.',
        location: 'Whitefield, Bengaluru',
      },
      {
        name: 'Keytruda (Pembrolizumab 100mg Injection)',
        genericName: 'Pembrolizumab',
        strength: '100 mg / 4 mL',
        category: 'Oncology',
        quantity: 1,
        batchNumber: 'KEY-8812-MSD',
        expiryDate: futureDate4,
        storageCondition: 'Cold Chain (2-8°C Refrigerated, Protect from Light)',
        packageCondition: 'Certified Cold-Chain Sealed Vial with Temperature Logger',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 215000,
        affordablePrice: 6500,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Surplus oncology immunotherapy vial from hospital oncology department. Strict continuous cold-chain logger verified.',
        location: 'Indiranagar, Bengaluru',
      },
      {
        name: 'Jakavi (Ruxolitinib 20mg Tablets)',
        genericName: 'Ruxolitinib',
        strength: '20 mg',
        category: 'Oncology',
        quantity: 56,
        batchNumber: 'JAK-1049-NVR',
        expiryDate: futureDate3,
        storageCondition: 'Store below 30°C',
        packageCondition: 'Unopened Manufacturer Blister Strips in Box',
        imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
        originalPrice: 98000,
        affordablePrice: 3200,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Myelofibrosis and polycythemia vera targeted therapy. Sealed pack with manufacturer authentication seal.',
        location: 'Jayanagar, Bengaluru',
      },
      {
        name: 'Exemptia (Adalimumab 40mg/0.8mL Pen)',
        genericName: 'Adalimumab',
        strength: '40 mg / 0.8 mL',
        category: 'Critical Care',
        quantity: 2,
        batchNumber: 'ADM-6721-ZYD',
        expiryDate: futureDate2,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Intact Cold-Chain Box with Integrity Seal',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
        originalPrice: 24500,
        affordablePrice: 1600,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Autoimmune anti-TNF biologic pen for rheumatoid arthritis / Crohn\'s. Continuous cold-chain logger verified.',
        location: 'Whitefield, Bengaluru',
      },
      {
        name: 'Entresto (Sacubitril & Valsartan 100mg)',
        genericName: 'Sacubitril / Valsartan',
        strength: '100 mg (49mg/51mg)',
        category: 'Cardiology',
        quantity: 28,
        batchNumber: 'ENT-3920-NV',
        expiryDate: futureDate5,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 4200,
        affordablePrice: 450,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Gold standard heart failure treatment. Unopened monthly pack donated due to dosage step-up.',
        location: 'Koramangala, Bengaluru',
      },
      {
        name: 'Sprycel (Dasatinib 70mg Tablets)',
        genericName: 'Dasatinib',
        strength: '70 mg',
        category: 'Oncology',
        quantity: 60,
        batchNumber: 'DAS-5021-BMS',
        expiryDate: futureDate3,
        storageCondition: 'Store at 20°C to 25°C',
        packageCondition: 'Unopened Factory Sealed Bottle with Hologram',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 42000,
        affordablePrice: 2200,
        prescriptionRequired: true,
        status: 'APPROVED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Targeted kinase inhibitor for Philadelphia chromosome-positive CML. Unopened sealed bottle with security hologram.',
        location: 'Malleshwaram, Bengaluru',
      },
      // EXPENSIVE HIGH-VALUE MEDICINES ALREADY SOLD / SUCCESSFULLY REDISTRIBUTED
      {
        name: 'Herclon (Trastuzumab Powder 440mg)',
        genericName: 'Trastuzumab',
        strength: '440 mg / vial',
        category: 'Oncology',
        quantity: 1,
        batchNumber: 'TRZ-0922-HER',
        expiryDate: futureDate2,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Certified Unbroken Cold-Chain Pack with Thermal Log',
        imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
        originalPrice: 54000,
        affordablePrice: 3500,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Critical oncology biologic. Successfully redistributed to Tata Memorial verified patient under emergency subsidy.',
        location: 'South Mumbai, Maharashtra',
      },
      {
        name: 'Ristova (Rituximab Solution 500mg)',
        genericName: 'Rituximab',
        strength: '500 mg / 50 mL',
        category: 'Oncology',
        quantity: 1,
        batchNumber: 'RIT-5188-BIO',
        expiryDate: futureDate4,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Factory Sealed Biologic Vial with Security Seal',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 36500,
        affordablePrice: 2800,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Non-Hodgkin lymphoma monoclonal antibody. Dispensed following verified oncology prescription.',
        location: 'Whitefield, Bengaluru',
      },
      {
        name: 'Tagrisso (Osimertinib 80mg Tablets)',
        genericName: 'Osimertinib',
        strength: '80 mg',
        category: 'Oncology',
        quantity: 30,
        batchNumber: 'OSI-7729-UK',
        expiryDate: futureDate5,
        storageCondition: 'Room Temperature (< 30°C)',
        packageCondition: 'Unopened Factory Sealed Bottle with Hologram',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 145000,
        affordablePrice: 4500,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Surplus targeted EGFR cancer therapy. Safely redirected saving patient over ₹1,40,000.',
        location: 'Koramangala, Bengaluru',
      },
      {
        name: 'Opdivo (Nivolumab 100mg Injection)',
        genericName: 'Nivolumab',
        strength: '100 mg / 10 mL',
        category: 'Oncology',
        quantity: 1,
        batchNumber: 'NIV-9931-BMS',
        expiryDate: futureDate2,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Certified Cold-Chain Biologic with Temperature Monitor',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 118000,
        affordablePrice: 4200,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Advanced lung/melanoma checkpoint inhibitor. Successfully redistributed to Kidwai Memorial Hospital verified patient under emergency subsidy.',
        location: 'Bengaluru, Karnataka',
      },
      {
        name: 'Lucentis (Ranibizumab 10mg/mL Solution)',
        genericName: 'Ranibizumab',
        strength: '10 mg / mL (0.23mL)',
        category: 'Critical Care',
        quantity: 1,
        batchNumber: 'RNB-4029-NOV',
        expiryDate: futureDate4,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Single-use Glass Vial with Sterile Tamper Seal',
        imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
        originalPrice: 26000,
        affordablePrice: 1800,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Retinal vascular biologic for macular degeneration. Preserved senior patient vision, saved family over ₹24,000.',
        location: 'South Mumbai, Maharashtra',
      },
      {
        name: 'Revlimid (Lenalidomide 25mg Capsules)',
        genericName: 'Lenalidomide',
        strength: '25 mg',
        category: 'Oncology',
        quantity: 21,
        batchNumber: 'LND-7718-CEL',
        expiryDate: futureDate5,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Unbroken Foil Blister Pack in Safety Carton',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 32000,
        affordablePrice: 1900,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Multiple myeloma maintenance immunomodulatory therapy. Dispensed to senior citizen patient under subsidized care.',
        location: 'Jayanagar, Bengaluru',
      },
      {
        name: 'Avastin (Bevacizumab 400mg Injection)',
        genericName: 'Bevacizumab',
        strength: '400 mg / 16 mL',
        category: 'Oncology',
        quantity: 1,
        batchNumber: 'BVC-3301-ROC',
        expiryDate: futureDate3,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Factory Sealed Biologic Carton with Cold Chain Indicator',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
        originalPrice: 39500,
        affordablePrice: 2600,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Colorectal and ovarian anti-angiogenic therapy. Successfully dispensed saving patient family ₹36,900.',
        location: 'Whitefield, Bengaluru',
      },
      {
        name: 'Enbrel (Etanercept 50mg Auto-injector)',
        genericName: 'Etanercept',
        strength: '50 mg / 1 mL',
        category: 'Critical Care',
        quantity: 4,
        batchNumber: 'ETN-8840-PFI',
        expiryDate: futureDate1,
        storageCondition: 'Cold Chain (2-8°C Refrigerated)',
        packageCondition: 'Factory Sealed 4-Pack Auto-injector Carton',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        originalPrice: 22000,
        affordablePrice: 1500,
        prescriptionRequired: true,
        status: 'SOLD',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        additionalNotes: 'Severe rheumatoid arthritis and ankylosing spondylitis biologic. Successfully redistributed with thermal verification.',
        location: 'Koramangala, Bengaluru',
      },
      // PENDING SUBMISSIONS (Visible in Admin verification queue)
      {
        name: 'Azithromycin Tablets IP',
        genericName: 'Azithromycin',
        strength: '500 mg',
        category: 'Antibiotics',
        quantity: 6,
        batchNumber: 'AZT-3390-X',
        expiryDate: futureDate2,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Intact Blister Foil Strip (Unbroken)',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        originalPrice: 195,
        affordablePrice: 40,
        prescriptionRequired: true,
        status: 'PENDING',
        donorId: donorUser._id,
        additionalNotes: '3 tablets remaining from course of 6. Uncut, sealed blister strip.',
        location: 'Indiranagar, Bengaluru',
      },
      // REJECTED SUBMISSION (Shows rejection reason)
      {
        name: 'Expired Ciprofloxacin Drops',
        genericName: 'Ciprofloxacin Eye/Ear Drops',
        strength: '0.3% w/v',
        category: 'Antibiotics',
        quantity: 1,
        batchNumber: 'CIP-0021-OLD',
        expiryDate: expiredDate,
        storageCondition: 'Room Temperature (15-25°C)',
        packageCondition: 'Partially Opened / Torn Foil (Not Eligible)',
        imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=600&q=80',
        originalPrice: 110,
        affordablePrice: 0,
        prescriptionRequired: true,
        status: 'REJECTED',
        donorId: donorUser._id,
        verifiedBy: pharmacistUser._id,
        rejectionReason: 'Expired batch (exceeded shelf-life) and opened liquid container violates safety standards.',
        additionalNotes: 'Liquid bottle was already opened.',
        location: 'Koramangala, Bengaluru',
      },
    ];

    medicines.forEach((m) => {
      if (!m.originalQuantity) m.originalQuantity = m.quantity;
      if (m.status === 'APPROVED' && !m.approvedAt) {
        m.approvedAt = new Date(Date.now() - 3600000 * 24 * 4);
      }
    });

    const createdMedicines = await Medicine.insertMany(medicines);
    console.log(`[Seed] Seeded ${createdMedicines.length} fictional medicines.`);

    // 3. Create Demo Requests in different stages for presentation
    const metforminMed = createdMedicines.find((m) => m.name.includes('Metformin'));
    let metforminReq = null;
    if (metforminMed) {
      metforminReq = await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: metforminMed._id,
        quantity: 30,
        status: 'Pending',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Community Healthcare Center, Ward 4',
        contactPhone: '+91 98765 43210',
        reasonNotes: 'Monthly diabetes maintenance course prescribed by clinic doctor.',
      });
      metforminMed.status = 'REQUESTED';
      metforminMed.activeRequestId = metforminReq._id;
      await metforminMed.save();
      console.log('[Seed] Created demo pending medicine request for Person B.');
    }

    const amoxicillinMed = createdMedicines.find((m) => m.name.includes('Amoxicillin'));
    let amoxicillinReq = null;
    if (amoxicillinMed) {
      amoxicillinReq = await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: amoxicillinMed._id,
        quantity: 15,
        status: 'Completed',
        approvedAt: new Date(Date.now() - 3600000 * 24 * 2),
        dispensedAt: new Date(Date.now() - 3600000 * 12),
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Jan Aushadhi Kendra Distribution Desk #3',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Prescription verified and dispensed under pharmacist supervision.',
        reasonNotes: 'Post-operative dental recovery course.',
      });
      amoxicillinMed.status = 'DISPENSED';
      amoxicillinMed.quantity = 15;
      amoxicillinMed.dispensedAt = new Date(Date.now() - 3600000 * 12);
      amoxicillinMed.activeRequestId = amoxicillinReq._id;
      await amoxicillinMed.save();
      console.log('[Seed] Created demo completed medicine request for Person B.');
    }

    const trastuzumabMed = createdMedicines.find((m) => m.name.includes('Trastuzumab'));
    if (trastuzumabMed) {
      await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: trastuzumabMed._id,
        quantity: 1,
        status: 'Completed',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Tata Memorial Center Outpatient Oncology Wing, Desk 2',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Oncologist prescription verified. Cold chain integrity intact. Dispensed successfully.',
        reasonNotes: 'HER2-positive targeted breast cancer maintenance therapy.',
      });
      console.log('[Seed] Created demo completed oncology request for Person B.');
    }

    const rituximabMed = createdMedicines.find((m) => m.name.includes('Rituximab'));
    if (rituximabMed) {
      await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: rituximabMed._id,
        quantity: 1,
        status: 'Completed',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Specialty Care Dispensing Center, Whitefield',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Multi-specialist clinical review passed. Cold storage verified at 4°C.',
        reasonNotes: 'Immunotherapy protocol prescribed by treating rheumatologist.',
      });
      console.log('[Seed] Created demo completed biologic request for Person B.');
    }

    const tagrissoMed = createdMedicines.find((m) => m.name.includes('Tagrisso'));
    if (tagrissoMed) {
      await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: tagrissoMed._id,
        quantity: 30,
        status: 'Completed',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Jan Aushadhi Kendra Distribution Desk #1',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Oncology board prescription and patient BPL card verified. Subsidized dispensing approved.',
        reasonNotes: 'Targeted EGFR T790M lung cancer ongoing maintenance course.',
      });
      console.log('[Seed] Created demo completed Tagrisso request for Person B.');
    }

    const opdivoMed = createdMedicines.find((m) => m.name.includes('Opdivo'));
    if (opdivoMed) {
      await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: opdivoMed._id,
        quantity: 1,
        status: 'Completed',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Kidwai Memorial Regional Cancer Center, Dispensing Unit 3',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Immunotherapy protocol verified. Certified 2-8°C cold chain transport handed over.',
        reasonNotes: 'Melanoma immune-oncology cycle prescribed by senior medical oncologist.',
      });
      console.log('[Seed] Created demo completed Opdivo request for Person B.');
    }

    const lucentisMed = createdMedicines.find((m) => m.name.includes('Lucentis'));
    if (lucentisMed) {
      await MedicineRequest.create({
        userId: recipientUser._id,
        donorId: donorUser._id,
        medicineId: lucentisMed._id,
        quantity: 1,
        status: 'Completed',
        prescriptionVerificationConfirmed: true,
        deliveryAddress: 'Ophthalmology Super-Specialty Clinic, Ward 2',
        contactPhone: '+91 98765 43210',
        adminNotes: 'Retina specialist prescription checked. Sealed glass vial tamper seal verified.',
        reasonNotes: 'Neovascular AMD anti-VEGF injection for senior citizen patient.',
      });
      console.log('[Seed] Created demo completed Lucentis request for Person B.');
    }

    // 4. Seed Live Notifications
    await Notification.create([
      {
        userId: donorUser._id,
        type: 'MEDICINE_REQUESTED',
        title: 'Your Donated Medicine Has Been Requested!',
        message: 'A verified recipient has requested your donated Metformin HCl (30 units). Pharmacist verification is underway.',
        medicineId: metforminMed?._id,
        requestId: metforminReq?._id,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: donorUser._id,
        type: 'MEDICINE_DISPENSED',
        title: 'Journey Complete: Medicine Delivered!',
        message: 'Your donated Amoxicillin Trihydrate was successfully handed over to a verified patient. Thank you for your impact!',
        medicineId: amoxicillinMed?._id,
        requestId: amoxicillinReq?._id,
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        userId: donorUser._id,
        type: 'VERIFICATION_APPROVED',
        title: 'Medicine Approved by Pharmacist',
        message: 'Your donation of Metformin HCl passed pharmacist inspection and is now listed in the community repository.',
        medicineId: metforminMed?._id,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      },
      {
        userId: recipientUser._id,
        type: 'REQUEST_SUBMITTED',
        title: 'Medicine Request Submitted',
        message: 'Your request for Metformin HCl (30 units) has been received and queued for pharmacist review.',
        medicineId: metforminMed?._id,
        requestId: metforminReq?._id,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: recipientUser._id,
        type: 'REQUEST_DISPENSED',
        title: 'Medicine Dispensed / Completed',
        message: 'Your requested Amoxicillin Trihydrate has been dispensed and handed over by the clinic pharmacy.',
        medicineId: amoxicillinMed?._id,
        requestId: amoxicillinReq?._id,
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ]);
    console.log('[Seed] Created demo notifications for Donor and Recipient.');

    // 6. Create Realistic Audit Logs (Audit Trail for Admin Command Center)
    await AuditLog.insertMany([
      {
        timestamp: new Date(Date.now() - 3600000 * 72),
        actor: 'Aarav Patel',
        actorId: donorUser._id,
        actorRole: 'user',
        action: 'REGISTER',
        entity: 'User',
        entityId: donorUser._id.toString(),
        details: 'Community member registered account via web portal',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 68),
        actor: 'Priya Verma',
        actorId: recipientUser._id,
        actorRole: 'user',
        action: 'REGISTER',
        entity: 'User',
        entityId: recipientUser._id.toString(),
        details: 'Community member registered account via web portal',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 48),
        actor: 'Aarav Patel',
        actorId: donorUser._id,
        actorRole: 'user',
        action: 'SUBMIT_MEDICINE',
        entity: 'Medicine',
        entityId: amoxicillinMed ? amoxicillinMed._id.toString() : 'med-amx',
        details: 'Submitted Amoxicillin Trihydrate 500 mg (Qty: 30, Batch: AMX-9821-B) with cold-chain and packaging checklist',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 40),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'APPROVE_MEDICINE',
        entity: 'Medicine',
        entityId: amoxicillinMed ? amoxicillinMed._id.toString() : 'med-amx',
        details: 'Clinical inspection passed: intact foil strip, verified batch, 14 months shelf life. Published to repository.',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 36),
        actor: 'Aarav Patel',
        actorId: donorUser._id,
        actorRole: 'user',
        action: 'SUBMIT_MEDICINE',
        entity: 'Medicine',
        entityId: metforminMed ? metforminMed._id.toString() : 'med-met',
        details: 'Submitted Metformin Hydrochloride 500 mg SR (Qty: 60, Batch: MET-4412-C)',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 30),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'APPROVE_MEDICINE',
        entity: 'Medicine',
        entityId: metforminMed ? metforminMed._id.toString() : 'med-met',
        details: 'Clinical inspection passed: factory sealed box, 20 months shelf life remaining.',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 24),
        actor: 'Priya Verma',
        actorId: recipientUser._id,
        actorRole: 'user',
        action: 'CREATE_REQUEST',
        entity: 'MedicineRequest',
        entityId: amoxicillinReq ? amoxicillinReq._id.toString() : 'req-amx',
        details: 'Submitted subsidized medicine request for Amoxicillin Trihydrate (30 units) with physician prescription confirmation',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 18),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'APPROVE_REQUEST',
        entity: 'MedicineRequest',
        entityId: amoxicillinReq ? amoxicillinReq._id.toString() : 'req-amx',
        details: 'Prescription matched against requested dosage. Inventory reserved for patient pickup.',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 12),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'DISPENSE_MEDICINE',
        entity: 'Medicine',
        entityId: amoxicillinMed ? amoxicillinMed._id.toString() : 'med-amx',
        details: 'Medicine physically dispensed to verified recipient Priya Verma. Counseling instructions provided.',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 11),
        actor: 'MediCycle System',
        actorId: null,
        actorRole: 'system',
        action: 'COMPLETE_MEDICINE',
        entity: 'Medicine',
        entityId: amoxicillinMed ? amoxicillinMed._id.toString() : 'med-amx',
        details: 'Redistribution journey completed. Illustrative patient savings ₹195 recorded in community impact ledger.',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 8),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'QUARANTINE_INVENTORY',
        entity: 'Medicine',
        entityId: 'med-syrup-rejected',
        details: 'Quarantined Paracetamol Pediatric Syrup: Expired batch and unsealed container violate biosafety rules.',
        result: 'REJECTED',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 4),
        actor: 'Aarav Patel',
        actorId: donorUser._id,
        actorRole: 'user',
        action: 'SUBMIT_MEDICINE',
        entity: 'Medicine',
        entityId: 'med-imatinib',
        details: 'Submitted Imatinib Mesylate Tablets IP 400 mg (Qty: 30, Batch: IMT-5510-O) - Critical oncology therapy',
        result: 'SUCCESS',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2),
        actor: 'Dr. Anita Sharma',
        actorId: pharmacistUser._id,
        actorRole: 'pharmacist',
        action: 'APPROVE_MEDICINE',
        entity: 'Medicine',
        entityId: 'med-imatinib',
        details: 'Clinical review passed: Security hologram intact, manufacturer sealed bottle verified. Available for subsidized oncological request.',
        result: 'SUCCESS',
      },
    ]);
    console.log('[Seed] Created realistic audit log trail.');

    // 6. Create Seed MediPoints Transactions
    await MediPointsTransaction.create([
      {
        userId: donorUser._id,
        type: 'EARNING',
        points: 100,
        reason: 'Donation verification: Amoxicillin Trihydrate verified & approved',
        balanceAfter: 2400,
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        userId: donorUser._id,
        type: 'EARNING',
        points: 100,
        reason: 'Donation verification: Metformin Hydrochloride verified & approved',
        balanceAfter: 2300,
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
      {
        userId: recipientUser._id,
        type: 'EARNING',
        points: 100,
        reason: 'Donation verification: Paracetamol Tablets verified & approved',
        balanceAfter: 1000,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
    ]);
    console.log('[Seed] Created initial MediPoints transactions.');

    console.log('[Seed] Demo database seeding complete!');
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
  }
};

// If run directly
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  require('dotenv').config();

  (async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = seedData;
