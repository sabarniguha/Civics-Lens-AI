import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from './config';
import { Report, ReportStatus, OperationType, StatusHistoryItem } from '../types';

export const INITIAL_SAMPLE_REPORTS: Report[] = [
  {
    id: 'REP-10492',
    title: 'Severe pothole damaging wheel rims near school zone',
    description: 'A deep crater has formed in the westbound lane directly in front of Lincoln Elementary. Multiple vehicles have suffered popped tires and drivers are swerving unexpectedly into the bike lane.',
    category: 'Potholes & Road Damage',
    location: '450 North Lincoln Avenue (near 4th Street intersection)',
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    priority: 'High',
    status: 'In Progress',
    userId: 'seed-user-1',
    userEmail: 'sarah.jenkins@community.org',
    userName: 'Sarah Jenkins',
    isPublic: true,
    aiRecommendation: {
      suggestedCategory: 'Potholes & Road Damage',
      suggestedPriority: 'High',
      confidence: 96,
      explanation: 'Hazard adjacent to elementary school zone with high pedestrian traffic and reported vehicle damage.',
      recommendedAction: 'Deploy asphalt maintenance crew with cold patch asphalt within 24 hours. Place temporary traffic safety cone.',
      detectedUrgencyFlags: ['School Zone Hazard', 'Vehicle Damage Risk', 'Swerving Traffic Hazard'],
      isLiveAi: false,
    },
    statusHistory: [
      {
        id: 'hist-1',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedBy: 'Sarah Jenkins (Resident)',
        notes: 'Submitted initial citizen report with photo.',
      },
      {
        id: 'hist-2',
        status: 'Under Review',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Municipal Dispatcher Martinez',
        notes: 'Triaged by Public Works dispatch. Work order #8920 generated.',
      },
      {
        id: 'hist-3',
        status: 'In Progress',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updatedBy: 'Road Crew Lead Davis',
        notes: 'Crew scheduled for milling and cold patch repair this afternoon.',
      },
    ],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'REP-10493',
    title: 'Flickering high-voltage streetlight and exposed wiring base',
    description: 'The decorative metal lamppost is flickering violently every evening, and the bottom inspection panel is hanging open with exposed wires reachable by children and dogs.',
    category: 'Streetlights & Electrical',
    location: 'Corner of Maple Street and Elmwood Boulevard',
    latitude: 37.779,
    longitude: -122.412,
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    priority: 'Critical',
    status: 'Under Review',
    userId: 'seed-user-2',
    userEmail: 'david.chen@community.org',
    userName: 'David Chen',
    isPublic: true,
    aiRecommendation: {
      suggestedCategory: 'Streetlights & Electrical',
      suggestedPriority: 'Critical',
      confidence: 98,
      explanation: 'Exposed electrical wiring at sidewalk level poses acute electrocution danger to pedestrians and pets.',
      recommendedAction: 'Immediate dispatch of certified municipal electrician to de-energize and secure inspection plate cover.',
      detectedUrgencyFlags: ['Electrocution Risk', 'Exposed Wiring', 'Sidewalk Accessibility'],
      isLiveAi: false,
    },
    statusHistory: [
      {
        id: 'hist-4',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedBy: 'David Chen (Resident)',
        notes: 'Submitted report after evening walk with dog.',
      },
      {
        id: 'hist-5',
        status: 'Under Review',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        updatedBy: 'City Safety Triage',
        notes: 'Flagged as Critical electrical hazard. Utility team notified.',
      },
    ],
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'REP-10494',
    title: 'Illegal commercial dumping of construction drywall and debris',
    description: 'A flatbed truck dumped approximately 15 bags of broken gypsum, wood pallets, and insulation along the alleyway blocking public access to garages.',
    category: 'Sanitation & Illegal Dumping',
    location: 'Alleyway behind 1820 Harrison Street',
    latitude: 37.768,
    longitude: -122.42,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    priority: 'Medium',
    status: 'Submitted',
    userId: 'seed-user-3',
    userEmail: 'elena.rodriguez@community.org',
    userName: 'Elena Rodriguez',
    isPublic: true,
    aiRecommendation: {
      suggestedCategory: 'Sanitation & Illegal Dumping',
      suggestedPriority: 'Medium',
      confidence: 92,
      explanation: 'Blocked accessway and uncontained commercial waste. No immediate chemical or fire hazard detected.',
      recommendedAction: 'Schedule sanitation heavy-loader truck and cross-reference code compliance permits for recent neighborhood renovations.',
      detectedUrgencyFlags: ['Blocked Alleyway', 'Code Violation'],
      isLiveAi: false,
    },
    statusHistory: [
      {
        id: 'hist-6',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedBy: 'Elena Rodriguez (Resident)',
        notes: 'Resident submission received.',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'REP-10495',
    title: 'Storm drain clogged with heavy autumn leaves causing street flooding',
    description: 'The curb catch basin is completely obstructed with compacted mud and foliage. During light rain yesterday, water pooled 6 inches deep across the crosswalk.',
    category: 'Water, Sewer & Drainage',
    location: 'Crosswalk at Oak & 12th Avenue',
    latitude: 37.771,
    longitude: -122.428,
    priority: 'High',
    status: 'Resolved',
    userId: 'seed-user-4',
    userEmail: 'marcus.vance@community.org',
    userName: 'Marcus Vance',
    isPublic: true,
    aiRecommendation: {
      suggestedCategory: 'Water, Sewer & Drainage',
      suggestedPriority: 'High',
      confidence: 94,
      explanation: 'Localized flooding impairs pedestrian crosswalks and risks property water damage during heavy rainfall.',
      recommendedAction: 'Dispatch storm water vacuum truck to clear grate and flush subsurface catch basin.',
      detectedUrgencyFlags: ['Localized Flooding Risk', 'Crosswalk Obstruction'],
      isLiveAi: false,
    },
    statusHistory: [
      {
        id: 'hist-7',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updatedBy: 'Marcus Vance (Resident)',
        notes: 'Submitted issue before upcoming forecast rain.',
      },
      {
        id: 'hist-8',
        status: 'Under Review',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: 'Water Resources Dept',
        notes: 'Added to stormwater maintenance run.',
      },
      {
        id: 'hist-9',
        status: 'In Progress',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Vac-Truck Unit 3',
        notes: 'Jet cleaning catch basin and clearing drain cover.',
      },
      {
        id: 'hist-10',
        status: 'Resolved',
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        updatedBy: 'Inspector Thorne',
        notes: 'Catch basin thoroughly cleared, flow tested, and verified clear of obstructions.',
      },
    ],
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },
  {
    id: 'REP-10496',
    title: 'Broken wooden slats on park playground perimeter bench',
    description: 'Two center planks on the wooden bench overlooking the toddler swing set have snapped with sharp splinters sticking upright.',
    category: 'Parks & Public Facilities',
    location: 'Riverside Community Park, North Playground Area',
    latitude: 37.785,
    longitude: -122.405,
    priority: 'Low',
    status: 'Submitted',
    userId: 'seed-user-5',
    userEmail: 'laura.k@community.org',
    userName: 'Laura Kim',
    isPublic: true,
    aiRecommendation: {
      suggestedCategory: 'Parks & Public Facilities',
      suggestedPriority: 'Low',
      confidence: 89,
      explanation: 'Amenity physical damage in public playground. Minor laceration hazard for small children.',
      recommendedAction: 'Carpentry crew replacement of 2 oak slats and safety sand finish.',
      detectedUrgencyFlags: ['Splinter Hazard', 'Park Amenity'],
      isLiveAi: false,
    },
    statusHistory: [
      {
        id: 'hist-11',
        status: 'Submitted',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedBy: 'Laura Kim (Resident)',
        notes: 'Reported during weekend park visit.',
      },
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
];

// In-memory / local fallback store for seamless demonstration if guest or network offline
let localFallbackReports: Report[] = [...INITIAL_SAMPLE_REPORTS];

export async function fetchReportsFromFirestore(): Promise<Report[]> {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }
    const reports: Report[] = [];
    querySnapshot.forEach((docSnapshot) => {
      reports.push({ id: docSnapshot.id, ...docSnapshot.data() } as Report);
    });
    return reports;
  } catch (error) {
    console.warn('Firestore fetch failed, using local/demo dataset:', error);
    return localFallbackReports;
  }
}

export function subscribeToReports(
  onUpdate: (reports: Report[], isDemo: boolean) => void
): () => void {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed or provide initial sample reports
          onUpdate(localFallbackReports, false);
        } else {
          const list: Report[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Report);
          });
          onUpdate(list, false);
        }
      },
      (error) => {
        console.warn('Realtime subscription error, operating in resilient Demo Mode:', error.message);
        onUpdate(localFallbackReports, true);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach listener, falling back to demo state:', err);
    onUpdate(localFallbackReports, true);
    return () => {};
  }
}

export async function saveReportToFirestore(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<Report> {
  const newId = `REP-${Math.floor(10000 + Math.random() * 90000)}`;
  const nowIso = new Date().toISOString();

  const initialHistory: StatusHistoryItem = {
    id: `hist-${Date.now()}`,
    status: 'Submitted',
    timestamp: nowIso,
    updatedBy: reportData.userName || 'Resident',
    updatedByEmail: reportData.userEmail,
    notes: 'Citizen report submitted to CivicLens AI dispatch system.',
  };

  const newReport: Report = {
    ...reportData,
    id: newId,
    status: 'Submitted',
    isPublic: true,
    statusHistory: [initialHistory],
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  try {
    const docRef = doc(db, 'reports', newId);
    await setDoc(docRef, newReport);
    // Also update local fallback cache
    localFallbackReports = [newReport, ...localFallbackReports];
    return newReport;
  } catch (error) {
    console.warn('Failed to save to Firestore directly, saving to local fallback store:', error);
    localFallbackReports = [newReport, ...localFallbackReports];
    return newReport;
  }
}

export async function updateReportStatusInFirestore(
  reportId: string,
  newStatus: ReportStatus,
  note: string,
  updatedByName: string,
  updatedByEmail?: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  const historyEntry: StatusHistoryItem = {
    id: `hist-${Date.now()}`,
    status: newStatus,
    timestamp: nowIso,
    updatedBy: updatedByName,
    updatedByEmail: updatedByEmail || '',
    notes: note.trim() || `Status updated to ${newStatus}`,
  };

  try {
    const docRef = doc(db, 'reports', reportId);
    // Update local store as well
    const existingIndex = localFallbackReports.findIndex((r) => r.id === reportId);
    if (existingIndex >= 0) {
      const updatedHistory = [...localFallbackReports[existingIndex].statusHistory, historyEntry];
      localFallbackReports[existingIndex] = {
        ...localFallbackReports[existingIndex],
        status: newStatus,
        updatedAt: nowIso,
        statusHistory: updatedHistory,
      };
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: nowIso,
        statusHistory: updatedHistory,
      });
    }
  } catch (error) {
    console.warn('Firestore update failed, updated in local session:', error);
    const existingIndex = localFallbackReports.findIndex((r) => r.id === reportId);
    if (existingIndex >= 0) {
      localFallbackReports[existingIndex] = {
        ...localFallbackReports[existingIndex],
        status: newStatus,
        updatedAt: nowIso,
        statusHistory: [...localFallbackReports[existingIndex].statusHistory, historyEntry],
      };
    }
  }
}

export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete failed:', error);
  } finally {
    localFallbackReports = localFallbackReports.filter((r) => r.id !== reportId);
  }
}

// Function to optionally seed Firestore with realistic reports if the database is fresh
export async function seedInitialReportsToFirestore(): Promise<void> {
  try {
    for (const report of INITIAL_SAMPLE_REPORTS) {
      const docRef = doc(db, 'reports', report.id);
      await setDoc(docRef, report, { merge: true });
    }
  } catch (error) {
    console.warn('Note on seeding: Firestore seeding skipped or restricted by rules:', error);
  }
}
