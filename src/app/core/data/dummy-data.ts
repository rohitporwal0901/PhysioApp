export const DUMMY_DOCTORS = [
    { id: 'D1', name: 'Dr. Sarah Jenkins', specialty: 'Sports Injury', rating: 4.8, available: true, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 'D2', name: 'Dr. Mark Lee', specialty: 'Neurological Rehab', rating: 4.9, available: false, image: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { id: 'D3', name: 'Dr. Emily Chen', specialty: 'Pediatric Physiotherapy', rating: 4.7, available: true, image: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 'D4', name: 'Dr. James Wilson', specialty: 'Orthopedics', rating: 4.6, available: true, image: 'https://randomuser.me/api/portraits/men/60.jpg' },
    { id: 'D5', name: 'Dr. Anita Desai', specialty: 'Geriatric Rehab', rating: 4.9, available: true, image: 'https://randomuser.me/api/portraits/women/88.jpg' },
    { id: 'D6', name: 'Dr. Carlos Mendez', specialty: 'Cardiopulmonary', rating: 4.5, available: false, image: 'https://randomuser.me/api/portraits/men/32.jpg' }
];

export const DUMMY_APPOINTMENTS = [
    { id: 'A1', patientName: 'John Doe', patientImage: 'https://randomuser.me/api/portraits/men/11.jpg', doctorId: 'D1', time: '09:00 AM', duration: '45m', status: 'completed', type: 'Initial Assessment', date: '2023-11-01', notes: 'Patient reports mild lower back pain.' },
    { id: 'A2', patientName: 'Alice Smith', patientImage: 'https://randomuser.me/api/portraits/women/11.jpg', doctorId: 'D1', time: '10:00 AM', duration: '30m', status: 'completed', type: 'Follow-up Therapy', date: '2023-11-01', notes: 'Progressing well with stretches.' },
    { id: 'A5', patientName: 'Mike Johnson', patientImage: 'https://randomuser.me/api/portraits/men/44.jpg', doctorId: 'D1', time: '11:00 AM', duration: '60m', status: 'scheduled', type: 'Post-op Rehab', date: '2023-11-01', notes: 'First session after knee surgery.' },
    { id: 'A6', patientName: 'Sarah Connor', patientImage: 'https://randomuser.me/api/portraits/women/55.jpg', doctorId: 'D1', time: '01:00 PM', duration: '45m', status: 'scheduled', type: 'Sports Massage', date: '2023-11-01', notes: 'Prep for upcoming marathon.' },
    { id: 'A3', patientName: 'Bob Brown', patientImage: 'https://randomuser.me/api/portraits/men/22.jpg', doctorId: 'D2', time: '01:00 PM', duration: '30m', status: 'pending', type: 'Routine Checkup', date: '2023-11-01', notes: '' },
    { id: 'A4', patientName: 'Charlie Davis', patientImage: 'https://randomuser.me/api/portraits/men/33.jpg', doctorId: 'D3', time: '02:30 PM', duration: '45m', status: 'cancelled', type: 'Neuromuscular Re-education', date: '2023-11-01', notes: '' },
];

export const DUMMY_PATIENTS = [
    { id: 'P1', name: 'John Doe', age: 45, condition: 'Lower Back Pain', lastVisit: '2023-10-15', assignedDoctor: 'Dr. Sarah Jenkins', status: 'active', image: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { id: 'P2', name: 'Alice Smith', age: 32, condition: 'Post-op Rehab', lastVisit: '2023-10-20', assignedDoctor: 'Dr. Sarah Jenkins', status: 'active', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
    { id: 'P3', name: 'Bob Brown', age: 58, condition: 'Sports Injury', lastVisit: '2023-09-05', assignedDoctor: 'Dr. Mark Lee', status: 'discharged', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: 'P4', name: 'Charlie Davis', age: 24, condition: 'Neuromuscular Re-education', lastVisit: '2023-10-25', assignedDoctor: 'Dr. Emily Chen', status: 'active', image: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { id: 'P5', name: 'Mike Johnson', age: 41, condition: 'Knee Surgery Rehab', lastVisit: '2023-10-28', assignedDoctor: 'Dr. Sarah Jenkins', status: 'active', image: 'https://randomuser.me/api/portraits/men/44.jpg' },
    { id: 'P6', name: 'Sarah Connor', age: 29, condition: 'Sports Massage', lastVisit: '2023-10-30', assignedDoctor: 'Dr. Sarah Jenkins', status: 'active', image: 'https://randomuser.me/api/portraits/women/55.jpg' }
];
