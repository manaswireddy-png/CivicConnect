import { Grievance, StatusHistory, Feedback, GrievanceStatus, PotentialDuplicateMatch } from '../src/types';
import { INITIAL_GRIEVANCES, INITIAL_STATUS_HISTORY } from '../src/data/initialGrievances';

// In-memory server store initialized with verified initial records
let serverGrievances: Grievance[] = [...INITIAL_GRIEVANCES];
let serverHistory: StatusHistory[] = [...INITIAL_STATUS_HISTORY];
let serverFeedback: Feedback[] = [];

// Jaccard word similarity helper for backend duplicate detection
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

export function detectDuplicates(target: Grievance): PotentialDuplicateMatch[] {
  const matches: PotentialDuplicateMatch[] = [];
  serverGrievances.forEach((g) => {
    if (g.referenceId === target.referenceId) return;

    const sameCategory = g.category.toLowerCase() === target.category.toLowerCase();
    const descSim = calculateSimilarity(g.description, target.description);
    const locSim = calculateSimilarity(g.location, target.location);
    const subjectSim = calculateSimilarity(g.subject, target.subject);

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
}

export function getAllGrievances(filters?: {
  userId?: string;
  role?: string;
  status?: string;
  category?: string;
  department?: string;
  search?: string;
}): Grievance[] {
  let list = [...serverGrievances];

  if (filters?.userId && filters?.role !== 'admin') {
    list = list.filter(g => g.userId === filters.userId || (filters.userId === 'demo-citizen-1' && g.userId === 'demo-citizen-1'));
  }

  if (filters?.status && filters.status !== 'All') {
    list = list.filter(g => g.status === filters.status);
  }

  if (filters?.category && filters.category !== 'All') {
    list = list.filter(g => g.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.department && filters.department !== 'All') {
    list = list.filter(g => g.department.toLowerCase().includes(filters.department!.toLowerCase()));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      g =>
        g.referenceId.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getGrievanceByRef(referenceId: string): Grievance | undefined {
  const clean = referenceId.trim().toUpperCase();
  return serverGrievances.find(g => g.referenceId.toUpperCase() === clean);
}

export function createGrievance(data: {
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  description: string;
  category: string;
  department: string;
  location: string;
  landmark?: string;
  pincode?: string;
  priority?: any;
  attachmentUrl?: string;
}): Grievance {
  const now = new Date().toISOString();
  // Generate collision-resistant reference ID format: GRA-2026-XXXXX
  const timestampCounter = Date.now().toString().slice(-5);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const referenceId = `GRA-2026-${timestampCounter}${randomSuffix}`.slice(0, 14);

  const newGrievance: Grievance = {
    ...data,
    referenceId,
    priority: data.priority || 'Medium',
    status: 'Submitted',
    createdAt: now,
    updatedAt: now,
  };

  const dupes = detectDuplicates(newGrievance);
  if (dupes.length > 0) {
    newGrievance.isDuplicateFlagged = true;
    newGrievance.potentialDuplicates = dupes;
    newGrievance.duplicateOf = dupes[0].referenceId;
  }

  serverGrievances.unshift(newGrievance);

  // Add initial history
  serverHistory.unshift({
    id: `hist-${Date.now()}`,
    grievanceId: referenceId,
    referenceId: referenceId,
    status: 'Submitted',
    note: 'Grievance lodged by citizen via CivicConnect AI portal. Automatic department routing completed.',
    updatedBy: data.userName || 'Citizen',
    timestamp: now,
  });

  return newGrievance;
}

export function updateGrievance(
  referenceId: string,
  newStatus: GrievanceStatus,
  note: string,
  updatedBy: string,
  resolutionNotes?: string
): Grievance | null {
  const clean = referenceId.trim().toUpperCase();
  const index = serverGrievances.findIndex(g => g.referenceId.toUpperCase() === clean);
  if (index === -1) return null;

  const now = new Date().toISOString();
  serverGrievances[index] = {
    ...serverGrievances[index],
    status: newStatus,
    updatedAt: now,
    resolutionNotes: resolutionNotes || serverGrievances[index].resolutionNotes,
  };

  serverHistory.unshift({
    id: `hist-${Date.now()}`,
    grievanceId: referenceId,
    referenceId,
    status: newStatus,
    note: note || `Status transitioned to ${newStatus}`,
    updatedBy: updatedBy || 'Authorized Officer',
    timestamp: now,
  });

  return serverGrievances[index];
}

export function getHistoryByRef(referenceId: string): StatusHistory[] {
  const clean = referenceId.trim().toUpperCase();
  return serverHistory
    .filter(h => h.referenceId?.toUpperCase() === clean || h.grievanceId?.toUpperCase() === clean)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function addGrievanceFeedback(
  referenceId: string,
  userId: string,
  rating: number,
  comments: string
) {
  const feedback: Feedback = {
    id: `fb-${Date.now()}`,
    userId,
    grievanceId: referenceId,
    referenceId,
    rating,
    comments,
    createdAt: new Date().toISOString(),
  };
  serverFeedback.push(feedback);

  updateGrievance(
    referenceId,
    'Closed',
    `Citizen satisfaction review: ${rating}/5 Stars - "${comments}"`,
    'System / Citizen Feedback'
  );

  return feedback;
}

export function getAnalytics() {
  const total = serverGrievances.length;
  const submitted = serverGrievances.filter(g => g.status === 'Submitted').length;
  const acknowledged = serverGrievances.filter(g => g.status === 'Acknowledged').length;
  const inProgress = serverGrievances.filter(g => g.status === 'In Progress').length;
  const resolved = serverGrievances.filter(g => g.status === 'Resolved' || g.status === 'Closed').length;

  const categoryCounts: Record<string, number> = {};
  serverGrievances.forEach(g => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });

  const locationCounts: Record<string, number> = {};
  serverGrievances.forEach(g => {
    const locKey = g.location.split(',')[0].trim();
    locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
  });

  const duplicateAlerts = serverGrievances
    .map(g => ({
      grievance: g,
      matches: detectDuplicates(g),
    }))
    .filter(item => item.matches.length > 0);

  return {
    total,
    submitted,
    acknowledged,
    inProgress,
    resolved,
    categoryCounts,
    locationCounts,
    duplicateAlerts,
  };
}
