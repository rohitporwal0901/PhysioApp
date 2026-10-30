import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

// 10 Verified High-Resolution Indian Doctors (100% matched with gender, name & specialization)
const doctorImages = {
  "Dr. Rajesh Sharma": "/assets/doctors/dr_rajesh_sharma.jpg", // Male, Senior Cardiologist
  "Dr. Priya Mehta": "/assets/doctors/dr_priya_mehta.jpg",     // Female, Neurologist
  "Dr. Amit Joshi": "/assets/doctors/dr_amit_joshi.jpg",       // Male, Orthopedic Surgeon
  "Dr. Neha Verma": "/assets/doctors/dr_neha_verma.jpg",       // Female, Dermatologist
  "Dr. Vikram Chouhan": "/assets/doctors/dr_vikram_chouhan.jpg", // Male, General Physician
  "Dr. Anjali Tiwari": "/assets/doctors/dr_anjali_tiwari.jpg",   // Female, Ophthalmologist
  "Dr. Sandeep Patel": "/assets/doctors/dr_sandeep_patel.jpg",   // Male, Pediatrician
  "Dr. Manoj Kothari": "/assets/doctors/dr_manoj_kothari.jpg",   // Male, Psychiatrist
  "Dr. Swati Saxena": "/assets/doctors/dr_swati_saxena.jpg",     // Female, Dentist
  "Dr. Rahul Patidar": "/assets/doctors/dr_rahul_patidar.jpg"    // Male, Physiotherapist
};

async function updateDoctorImages() {
  console.log('Connecting to Firestore to update doctors images...');
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  let updatedDoctors = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const docName = data.fullName || data.name;

    if (docName && doctorImages[docName]) {
      const newImg = doctorImages[docName];
      const docRef = doc(db, 'users', docSnap.id);
      await updateDoc(docRef, { 
        image: newImg,
        imageUrl: newImg
      });
      console.log(`[Doctor Updated] ${docName} (${data.specialization}) -> ${newImg}`);
      updatedDoctors++;
    }
  }

  console.log(`\nSuccessfully updated ${updatedDoctors} doctors in Firestore with verified Indian doctor images!`);
  process.exit(0);
}

updateDoctorImages().catch(err => {
  console.error('Error updating doctor images:', err);
  process.exit(1);
});
