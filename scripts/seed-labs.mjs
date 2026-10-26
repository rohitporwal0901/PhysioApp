import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBW2loJtXmLapGB4TkqfMjOdaaIxRE6VBg",
  authDomain: "physioapp-8d82a.firebaseapp.com",
  projectId: "physioapp-8d82a",
  storageBucket: "physioapp-8d82a.firebasestorage.app",
  messagingSenderId: "232327119808",
  appId: "1:232327119808:web:e81028a0ff76c7df057e25",
  measurementId: "G-GEZH3XS280"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// All 7 diagnostic labs with unique facility/diagnostic images
const labs = [
  // ── INDORE ──
  {
    fullName: "Central Diagnostics & Imaging Centre",
    name: "Central Diagnostics & Imaging Centre",
    email: "contact@centraldiagnosticsindore.com",
    phone: "+91 98260 11223",
    role: "lab",
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Scheme No. 54, Near Apollo Spectra, Vijay Nagar, Indore",
    rating: 5,
    ratingScore: 98,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 7:00 AM – 9:00 PM",
    testsOffered: "Blood Tests, Digital X-Ray, 3T MRI, 128-Slice CT Scan, 4D Ultrasound, Pathology",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=600&auto=format&fit=crop"
  },
  {
    fullName: "Indore Care Pathology & Scan Centre",
    name: "Indore Care Pathology & Scan Centre",
    email: "info@indorecarelab.com",
    phone: "+91 98260 22334",
    role: "lab",
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Sapna Sangeeta Main Road, Snehnagar, Indore",
    rating: 5,
    ratingScore: 95,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 8:00 AM – 8:30 PM",
    testsOffered: "Complete Health Checkup, CBC, Lipid Profile, Thyroid Panel, ECG, Vitamin D/B12",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=600&auto=format&fit=crop"
  },
  {
    fullName: "Apex Molecular Diagnostic Lab",
    name: "Apex Molecular Diagnostic Lab",
    email: "support@apexmolecularlab.com",
    phone: "+91 98260 33445",
    role: "lab",
    city: "Indore",
    state: "Madhya Pradesh",
    address: "MG Road, Near Treasure Island Mall, Indore",
    rating: 5,
    ratingScore: 97,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 7:30 AM – 8:00 PM",
    testsOffered: "RT-PCR, Biopsy, Allergy Panels, Genetic Testing, Hormonal Profile, Cancer Markers",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=600&auto=format&fit=crop"
  },

  // ── UJJAIN ──
  {
    fullName: "Mahakal City Pathology & Diagnostics",
    name: "Mahakal City Pathology & Diagnostics",
    email: "care@mahakalpathology.com",
    phone: "+91 94250 44556",
    role: "lab",
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "Madhav Nagar, Freeganj Main Road, Ujjain",
    rating: 5,
    ratingScore: 94,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 7:00 AM – 8:00 PM",
    testsOffered: "Routine Blood & Urine Tests, Liver Function Test (LFT), Kidney Panel (KFT), HbA1c",
    image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=600&auto=format&fit=crop"
  },
  {
    fullName: "Avantika Diagnostic & Ultrasound Centre",
    name: "Avantika Diagnostic & Ultrasound Centre",
    email: "avantika.diagnostics@gmail.com",
    phone: "+91 94250 55667",
    role: "lab",
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "Nanakheda Ring Road, Opp. Mahakal Commercial Complex, Ujjain",
    rating: 5,
    ratingScore: 96,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 8:00 AM – 8:00 PM",
    testsOffered: "Color Doppler, Pelvic Ultrasound, Digital Chest X-Ray, 2D Echo, Complete Pathology",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop"
  },

  // ── DEWAS ──
  {
    fullName: "Dewas Care Diagnostic Lab & X-Ray",
    name: "Dewas Care Diagnostic Lab & X-Ray",
    email: "contact@dewascarelab.com",
    phone: "+91 98930 66778",
    role: "lab",
    city: "Dewas",
    state: "Madhya Pradesh",
    address: "Station Road, Near Overbridge, Dewas",
    rating: 4,
    ratingScore: 92,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 8:00 AM – 7:30 PM",
    testsOffered: "Digital X-Ray, Blood Sugar Fasting/PP, Lipid Profile, Uric Acid, Home Sample Collection",
    image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=600&auto=format&fit=crop"
  },
  {
    fullName: "Chamunda Pathology & Collection Centre",
    name: "Chamunda Pathology & Collection Centre",
    email: "chamundapathology@gmail.com",
    phone: "+91 98930 77889",
    role: "lab",
    city: "Dewas",
    state: "Madhya Pradesh",
    address: "Vikas Nagar Main Market, Bhopal Road, Dewas",
    rating: 4,
    ratingScore: 90,
    active: true,
    isActive: true,
    available: true,
    isAvailable: true,
    timing: "Mon–Sat: 7:30 AM – 7:00 PM",
    testsOffered: "CBC, Dengue/Malaria Serology, Thyroid, Urine Culture, Free Home Blood Collection",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=600&auto=format&fit=crop"
  }
];

async function seedLabs() {
  console.log(`Starting to seed ${labs.length} diagnostic labs for Indore, Ujjain, and Dewas...`);
  const usersRef = collection(db, 'users');
  let inserted = 0;

  for (const lab of labs) {
    try {
      const labWithTimestamp = {
        ...lab,
        createdAt: serverTimestamp()
      };
      const res = await addDoc(usersRef, labWithTimestamp);
      inserted++;
      console.log(`[${inserted}/${labs.length}] Added: ${lab.fullName} (${lab.city}) -> ID: ${res.id}`);
    } catch (err) {
      console.error(`Failed to insert ${lab.fullName}:`, err);
    }
  }

  console.log(`\nSuccessfully inserted ${inserted}/${labs.length} diagnostic labs into Firestore 'users' collection!`);
  process.exit(0);
}

seedLabs().catch(err => {
  console.error("Fatal error seeding labs:", err);
  process.exit(1);
});
