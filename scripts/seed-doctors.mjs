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

// All 10 doctors with verified, gender-matched Indian doctor images
const doctors = [
  // ── INDORE ──
  {
    fullName: "Dr. Rajesh Sharma",
    name: "Dr. Rajesh Sharma",
    email: "dr.rajesh.sharma@healthhub.com",
    phone: "+91 98261 45210",
    role: "doctor",
    specialization: "Cardiology",
    specialty: "Cardiology",
    qualification: "DM",
    degreeFull: "MBBS, MD, DM (Cardiology)",
    experience: 15,
    consultationFee: 800,
    rating: 5,
    ratingScore: 98,
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Heart Care Clinic, Plot 42, Vijay Nagar",
    clinicAddress: "Plot 42, Near Scheme 54, Vijay Nagar, Indore",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Senior Interventional Cardiologist with 15+ years of clinical excellence in coronary interventions, hypertension management, and preventative cardiology.",
    image: "/assets/doctors/dr_rajesh_sharma.jpg",
    imageUrl: "/assets/doctors/dr_rajesh_sharma.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Priya Mehta",
    name: "Dr. Priya Mehta",
    email: "dr.priya.mehta@healthhub.com",
    phone: "+91 98262 33411",
    role: "doctor",
    specialization: "Neurology",
    specialty: "Neurology",
    qualification: "DM",
    degreeFull: "MBBS, MD (Medicine), DM (Neurology)",
    experience: 12,
    consultationFee: 900,
    rating: 5,
    ratingScore: 96,
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Neuro Wellness Super Speciality Clinic, Old Palasia",
    clinicAddress: "101, A.B. Road, Old Palasia, Indore",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    about: "Distinguished Neurologist focusing on stroke rehabilitation, epilepsy management, migraine therapeutics, and peripheral neuropathy disorders.",
    image: "/assets/doctors/dr_priya_mehta.jpg",
    imageUrl: "/assets/doctors/dr_priya_mehta.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Amit Joshi",
    name: "Dr. Amit Joshi",
    email: "dr.amit.joshi@healthhub.com",
    phone: "+91 98263 77890",
    role: "doctor",
    specialization: "Orthopedics",
    specialty: "Orthopedics",
    qualification: "MCh",
    degreeFull: "MBBS, MS, MCh (Orthopedics)",
    experience: 14,
    consultationFee: 700,
    rating: 5,
    ratingScore: 94,
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Orthopaedic Bone & Joint Care, Annapurna Road",
    clinicAddress: "Shop 4, Trade Centre, Annapurna Road, Indore",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Expert Joint Replacement & Arthroscopy Surgeon specializing in knee/hip replacements, sports ligament repairs, and advanced arthritis care.",
    image: "/assets/doctors/dr_amit_joshi.jpg",
    imageUrl: "/assets/doctors/dr_amit_joshi.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Neha Verma",
    name: "Dr. Neha Verma",
    email: "dr.neha.verma@healthhub.com",
    phone: "+91 98264 88912",
    role: "doctor",
    specialization: "Dermatology",
    specialty: "Dermatology",
    qualification: "MD",
    degreeFull: "MBBS, MD (Dermatology)",
    experience: 9,
    consultationFee: 600,
    rating: 5,
    ratingScore: 92,
    city: "Indore",
    state: "Madhya Pradesh",
    address: "Skin & Laser Wellness Clinic, New Palasia",
    clinicAddress: "56 Dukan Road, New Palasia, Indore",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Consultant Dermatologist and Aesthetician expert in acne therapy, hair-loss treatments, chronic eczema, psoriasis, and laser rejuvenation.",
    image: "/assets/doctors/dr_neha_verma.jpg",
    imageUrl: "/assets/doctors/dr_neha_verma.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },

  // ── UJJAIN ──
  {
    fullName: "Dr. Vikram Chouhan",
    name: "Dr. Vikram Chouhan",
    email: "dr.vikram.chouhan@healthhub.com",
    phone: "+91 94250 11234",
    role: "doctor",
    specialization: "General Physician",
    specialty: "General Physician",
    qualification: "MD",
    degreeFull: "MBBS, MD (Medicine)",
    experience: 11,
    consultationFee: 400,
    rating: 5,
    ratingScore: 93,
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "Chouhan Health Clinic, Madhav Nagar, Freeganj",
    clinicAddress: "Tower Chowk, Freeganj, Ujjain",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Trusted Physician specializing in comprehensive lifestyle disease management, diabetes care, viral fevers, and hypertension control.",
    image: "/assets/doctors/dr_vikram_chouhan.jpg",
    imageUrl: "/assets/doctors/dr_vikram_chouhan.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Anjali Tiwari",
    name: "Dr. Anjali Tiwari",
    email: "dr.anjali.tiwari@healthhub.com",
    phone: "+91 94251 22345",
    role: "doctor",
    specialization: "Ophthalmology",
    specialty: "Ophthalmology",
    qualification: "MS",
    degreeFull: "MBBS, MS (Ophthalmology)",
    experience: 13,
    consultationFee: 500,
    rating: 5,
    ratingScore: 95,
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "Netra Care Eye Hospital, Sanwer Road",
    clinicAddress: "Opp. Science College, Dewas Road, Ujjain",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Senior Eye Surgeon and Consultant Ophthalmologist specializing in cataract phacoemulsification, glaucoma management, and pediatric vision care.",
    image: "/assets/doctors/dr_anjali_tiwari.jpg",
    imageUrl: "/assets/doctors/dr_anjali_tiwari.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Sandeep Patel",
    name: "Dr. Sandeep Patel",
    email: "dr.sandeep.patel@healthhub.com",
    phone: "+91 94252 33456",
    role: "doctor",
    specialization: "Pediatrics",
    specialty: "Pediatrics",
    qualification: "MD",
    degreeFull: "MBBS, MD (Pediatrics)",
    experience: 10,
    consultationFee: 450,
    rating: 4,
    ratingScore: 90,
    city: "Ujjain",
    state: "Madhya Pradesh",
    address: "Child Care & Immunization Center, Nanakheda",
    clinicAddress: "Near Bus Stand, Nanakheda, Ujjain",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Experienced Child Specialist offering gentle, empathetic pediatric care, newborn screenings, developmental milestone checks, and complete vaccination.",
    image: "/assets/doctors/dr_sandeep_patel.jpg",
    imageUrl: "/assets/doctors/dr_sandeep_patel.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },

  // ── DEWAS ──
  {
    fullName: "Dr. Manoj Kothari",
    name: "Dr. Manoj Kothari",
    email: "dr.manoj.kothari@healthhub.com",
    phone: "+91 98930 44567",
    role: "doctor",
    specialization: "Psychiatry",
    specialty: "Psychiatry",
    qualification: "MD",
    degreeFull: "MBBS, MD (Psychiatry)",
    experience: 11,
    consultationFee: 400,
    rating: 5,
    ratingScore: 91,
    city: "Dewas",
    state: "Madhya Pradesh",
    address: "Manas Wellness Clinic, Station Road",
    clinicAddress: "Station Road, Near Railway Crossing, Dewas",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    about: "Consultant Psychiatrist dedicated to cognitive wellness, anxiety disorders, depression therapy, adult ADHD, and stress management.",
    image: "/assets/doctors/dr_manoj_kothari.jpg",
    imageUrl: "/assets/doctors/dr_manoj_kothari.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Swati Saxena",
    name: "Dr. Swati Saxena",
    email: "dr.swati.saxena@healthhub.com",
    phone: "+91 98931 55678",
    role: "doctor",
    specialization: "Dental",
    specialty: "Dental",
    qualification: "MDS",
    degreeFull: "BDS, MDS (Endodontics)",
    experience: 8,
    consultationFee: 350,
    rating: 5,
    ratingScore: 90,
    city: "Dewas",
    state: "Madhya Pradesh",
    address: "Smile Dental Studio, Vikas Nagar",
    clinicAddress: "Shop 12, Commercial Complex, Vikas Nagar, Dewas",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Dental surgeon offering root canal treatments, smile design, painless teeth whitening, dental implants, and pediatric oral health care.",
    image: "/assets/doctors/dr_swati_saxena.jpg",
    imageUrl: "/assets/doctors/dr_swati_saxena.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  },
  {
    fullName: "Dr. Rahul Patidar",
    name: "Dr. Rahul Patidar",
    email: "dr.rahul.patidar@healthhub.com",
    phone: "+91 98932 66789",
    role: "doctor",
    specialization: "Physiotherapy",
    specialty: "Physiotherapy",
    qualification: "MPT",
    degreeFull: "BPT, MPT (Musculoskeletal)",
    experience: 10,
    consultationFee: 500,
    rating: 5,
    ratingScore: 93,
    city: "Dewas",
    state: "Madhya Pradesh",
    address: "Active Spine & Rehab Clinic, Bhopal Road",
    clinicAddress: "Opp. District Hospital, Bhopal Road, Dewas",
    consultationType: "In-person & Online",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    about: "Senior Musculoskeletal & Sports Physiotherapist specializing in postural rehabilitation, post-surgery mobility, spinal decompression, and joint pain relief.",
    image: "/assets/doctors/dr_rahul_patidar.jpg",
    imageUrl: "/assets/doctors/dr_rahul_patidar.jpg",
    active: true,
    isActive: true,
    available: true,
    isAvailable: true
  }
];

async function seedDoctors() {
  console.log(`Starting to seed ${doctors.length} doctors for Indore, Ujjain, and Dewas...`);
  const usersRef = collection(db, 'users');
  let inserted = 0;

  for (const doc of doctors) {
    try {
      const docWithTimestamp = {
        ...doc,
        createdAt: serverTimestamp()
      };
      const res = await addDoc(usersRef, docWithTimestamp);
      inserted++;
      console.log(`[${inserted}/${doctors.length}] Added: ${doc.fullName} (${doc.specialization} - ${doc.city}) -> ID: ${res.id}`);
    } catch (err) {
      console.error(`Failed to insert ${doc.fullName}:`, err);
    }
  }

  console.log(`\nSuccessfully inserted ${inserted}/${doctors.length} doctors into Firestore 'users' collection!`);
  process.exit(0);
}

seedDoctors().catch(err => {
  console.error("Fatal error seeding doctors:", err);
  process.exit(1);
});
