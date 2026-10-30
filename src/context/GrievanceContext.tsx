import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { Grievance, GrievanceStatus, PotentialDuplicateMatch, StatusHistory, Feedback } from '../types';
import { INITIAL_GRIEVANCES, INITIAL_STATUS_HISTORY } from '../data/initialGrievances';
import { useAuth } from './AuthContext';

interface GrievanceContextType {
  grievances: Grievance[];
  statusHistory: StatusHistory[];
  loading: boolean;
  submitGrievance: (
    data: Omit<Grievance, 'id' | 'referenceId' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateGrievanceStatus: (
    referenceId: string,
    newStatus: GrievanceStatus,
    note: string,
    resolutionNotes?: string
  ) => Promise<void>;
  addFeedback: (referenceId: string, rating: number, comments: string) => Promise<void>;
  getGrievanceByReferenceId: (referenceId: string) => Grievance | undefined;
  getHistoryForGrievance: (referenceId: string) => StatusHistory[];
  detectDuplicatesForGrievance: (target: Grievance) => PotentialDuplicateMatch[];
}

const GrievanceContext = createContext<GrievanceContextType>({} as any);

export const useGrievances = () => useContext(GrievanceContext);

// Jaccard word similarity helper for duplicate detection
function calculateSimilarity(str1: string, str2: string): number {
  const getWords = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)
    );
  const set1 = getWords(str1);
  const set2 = getWords(str2);
  if (set1.size === 0 || set2.size === 0) return 0;
  let intersection = 0;
  set1.forEach(word => {
    if (set2.has(word)) intersection++;
  });
  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isAdmin } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const local = localStorage.getItem('civicconnect_stored_grievances');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return INITIAL_GRIEVANCES;
      }
    }
    return INITIAL_GRIEVANCES;
  });

  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>(() => {
    const local = localStorage.getItem('civicconnect_stored_history');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return INITIAL_STATUS_HISTORY;
      }
    }
    return INITIAL_STATUS_HISTORY;
  });

  const [loading, setLoading] = useState(false);

  // Sync with Firestore in real-time
  useEffect(() => {
    try {
      const q = query(collection(db, 'grievances'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Grievance[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as Grievance);
            });
            // Merge with initial demo grievances so demo items remain available
            const existingRefs = new Set(list.map(g => g.referenceId));
            const merged = [...list];
            INITIAL_GRIEVANCES.forEach(demo => {
              if (!existingRefs.has(demo.referenceId)) {
                merged.push(demo);
              }
            });
            setGrievances(merged);
            localStorage.setItem('civicconnect_stored_grievances', JSON.stringify(merged));
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot grievances warning (using local sync):', error.message);
        }
      );

      const histQuery = query(collection(db, 'statusHistory'));
      const unsubHist = onSnapshot(
        histQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: StatusHistory[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as StatusHistory);
            });
            const existingIds = new Set(list.map(h => h.id));
            const merged = [...list];
            INITIAL_STATUS_HISTORY.forEach(demo => {
              if (demo.id && !existingIds.has(demo.id)) {
                merged.push(demo);
              }
            });
            setStatusHistory(merged);
            localStorage.setItem('civicconnect_stored_history', JSON.stringify(merged));
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot statusHistory warning:', error.message);
        }
      );

      return () => {
        unsubscribe();
        unsubHist();
      };
    } catch (e) {
      console.warn('Could not attach Firestore snapshots, using state sync.');
    }
  }, []);

  const detectDuplicatesForGrievance = (target: Grievance): PotentialDuplicateMatch[] => {
    const matches: PotentialDuplicateMatch[] = [];
    grievances.forEach((g) => {
      if (g.referenceId === target.referenceId) return;

      const sameCategory = g.category.toLowerCase() === target.category.toLowerCase();
      const descSim = calculateSimilarity(g.description, target.description);
      const locSim = calculateSimilarity(g.location, target.location);
      const subjectSim = calculateSimilarity(g.subject, target.subject);

      // Composite similarity score
      let score = 0;
      if (sameCategory) score += 0.25;
      score += descSim * 0.45;
      score += locSim * 0.2;
      score += subjectSim * 0.1;

      if (score >= 0.35) {
        let reason = '';
        if (locSim > 0.4 && sameCategory) {
          reason = `Similar ${target.category} issue reported at nearby location (${g.location})`;
        } else if (descSim > 0.4) {
          reason = `High content similarity with existing complaint ${g.referenceId}`;
        } else {
          reason = `Repeated issue in ${target.location} area`;
        }

        matches.push({
          referenceId: g.referenceId,
          subject: g.subject,
          score: Math.round(score * 100),
          reason,
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  };

  const submitGrievance = async (
    data: Omit<Grievance, 'id' | 'referenceId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    setLoading(true);
    const now = new Date().toISOString();
    // Generate unique human-readable reference ID format e.g. GRA-2026-00045
    const timestampCounter = Date.now().toString().slice(-5);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const referenceId = `GRA-2026-${timestampCounter}${randomSuffix}`.slice(0, 14);

    const newGrievance: Grievance = {
      ...data,
      referenceId,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
    };

    // Run duplicate check
    const duplicateMatches = detectDuplicatesForGrievance(newGrievance);
    if (duplicateMatches.length > 0) {
      newGrievance.isDuplicateFlagged = true;
      newGrievance.potentialDuplicates = duplicateMatches;
      newGrievance.duplicateOf = duplicateMatches[0].referenceId;
    }

    // Save to Firestore
    try {
      const docRef = doc(db, 'grievances', referenceId);
      await setDoc(docRef, newGrievance);

      // Create initial statusHistory record
      const initialHistory: StatusHistory = {
        grievanceId: referenceId,
        referenceId: referenceId,
        status: 'Submitted',
        note: 'Grievance lodged by citizen via CivicConnect AI portal. Forwarded for initial triage.',
        updatedBy: userProfile?.name || 'Citizen',
        timestamp: now,
      };

      await addDoc(collection(db, 'statusHistory'), initialHistory);
    } catch (error) {
      console.warn('Firestore write failed, saving to local fallback storage:', error);
    }

    // Update local state immediately for instant responsive UI
    const updatedList = [newGrievance, ...grievances];
    setGrievances(updatedList);
    localStorage.setItem('civicconnect_stored_grievances', JSON.stringify(updatedList));

    const updatedHist = [
      {
        id: `hist-${Date.now()}`,
        grievanceId: referenceId,
        referenceId: referenceId,
        status: 'Submitted',
        note: 'Grievance lodged by citizen via CivicConnect AI portal.',
        updatedBy: userProfile?.name || 'Citizen',
        timestamp: now,
      },
      ...statusHistory,
    ];
    setStatusHistory(updatedHist);
    localStorage.setItem('civicconnect_stored_history', JSON.stringify(updatedHist));

    setLoading(false);
    return referenceId;
  };

  const updateGrievanceStatus = async (
    referenceId: string,
    newStatus: GrievanceStatus,
    note: string,
    resolutionNotes?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    const updatedBy = userProfile?.name || 'Authorized Officer';

    // Update in Firestore
    try {
      const docRef = doc(db, 'grievances', referenceId);
      const updateData: any = {
        status: newStatus,
        updatedAt: now,
      };
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }
      await updateDoc(docRef, updateData);

      // Save statusHistory
      const historyEntry: StatusHistory = {
        grievanceId: referenceId,
        referenceId: referenceId,
        status: newStatus,
        note: note || `Status updated to ${newStatus}.`,
        updatedBy,
        timestamp: now,
      };
      await addDoc(collection(db, 'statusHistory'), historyEntry);
    } catch (error) {
      console.warn('Firestore update failed, updating local state:', error);
    }

    // Synchronize local state
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.referenceId === referenceId) {
          return {
            ...g,
            status: newStatus,
            updatedAt: now,
            resolutionNotes: resolutionNotes || g.resolutionNotes,
          };
        }
        return g;
      })
    );

    setStatusHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        grievanceId: referenceId,
        referenceId: referenceId,
        status: newStatus,
        note: note || `Status transitioned to ${newStatus}`,
        updatedBy,
        timestamp: now,
      },
      ...prev,
    ]);
  };

  const addFeedback = async (
    referenceId: string,
    rating: number,
    comments: string
  ): Promise<void> => {
    const feedback: Feedback = {
      userId: userProfile?.uid || 'anonymous',
      grievanceId: referenceId,
      referenceId,
      rating,
      comments,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'feedback'), feedback);
    } catch (error) {
      console.warn('Feedback save fallback:', error);
    }

    // Also attach as audit note
    await updateGrievanceStatus(
      referenceId,
      'Closed',
      `Citizen feedback recorded: ${rating}/5 Stars - "${comments}"`,
      undefined
    );
  };

  const getGrievanceByReferenceId = (referenceId: string) => {
    const cleanId = referenceId.trim().toUpperCase();
    return grievances.find(
      (g) => g.referenceId.toUpperCase() === cleanId || g.id === cleanId
    );
  };

  const getHistoryForGrievance = (referenceId: string) => {
    const cleanId = referenceId.trim().toUpperCase();
    return statusHistory
      .filter(
        (h) =>
          h.referenceId?.toUpperCase() === cleanId ||
          h.grievanceId?.toUpperCase() === cleanId
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  };

  return (
    <GrievanceContext.Provider
      value={{
        grievances,
        statusHistory,
        loading,
        submitGrievance,
        updateGrievanceStatus,
        addFeedback,
        getGrievanceByReferenceId,
        getHistoryForGrievance,
        detectDuplicatesForGrievance,
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};
