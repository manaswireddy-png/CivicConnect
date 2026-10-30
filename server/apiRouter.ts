import { Router } from 'express';
import { handleChatQuery, handleGrievanceSuggestion } from './geminiHandler';
import {
  getAllGrievances,
  getGrievanceByRef,
  createGrievance,
  updateGrievance,
  getHistoryByRef,
  addGrievanceFeedback,
  getAnalytics,
} from './grievanceStore';
import { VERIFIED_SERVICES } from '../src/data/servicesData';

export const apiRouter = Router();

// ==========================================
// 1. GEMINI AI ASSISTANT ENDPOINTS
// ==========================================

apiRouter.post('/gemini/chat', async (req, res) => {
  try {
    const { query, history, language } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await handleChatQuery(query, history || [], language || 'en');
    return res.json(result);
  } catch (error: any) {
    console.error('API /gemini/chat error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

apiRouter.post('/gemini/suggest-grievance', async (req, res) => {
  try {
    const { description, location } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const result = await handleGrievanceSuggestion(description, location || '');
    return res.json(result);
  } catch (error: any) {
    console.error('API /gemini/suggest-grievance error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// ==========================================
// 2. GRIEVANCE SUBMISSION & MANAGEMENT ENDPOINTS
// ==========================================

// List grievances (with role & user filters)
apiRouter.get('/grievances', (req, res) => {
  try {
    const { userId, role, status, category, department, search } = req.query as Record<string, string>;
    const list = getAllGrievances({ userId, role, status, category, department, search });
    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to list grievances' });
  }
});

// Submit a new civic grievance
apiRouter.post('/grievances', (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      subject,
      description,
      category,
      department,
      location,
      landmark,
      pincode,
      priority,
      attachmentUrl,
    } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!description || description.trim().length < 15) {
      return res.status(400).json({ error: 'Description must be at least 15 characters' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const grievance = createGrievance({
      userId: userId || 'anonymous',
      userName: userName || 'Citizen',
      userEmail: userEmail || 'citizen@telangana.gov.in',
      subject: subject.trim(),
      description: description.trim(),
      category: category || 'General Civic Amenities',
      department: department || 'Greater Hyderabad Municipal Corporation (GHMC)',
      location: location.trim(),
      landmark: landmark ? landmark.trim() : undefined,
      pincode: pincode ? pincode.trim() : undefined,
      priority: priority || 'Medium',
      attachmentUrl: attachmentUrl || undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully',
      referenceId: grievance.referenceId,
      data: grievance,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to submit grievance' });
  }
});

// Track a grievance by reference ID with privacy protection
apiRouter.get('/grievances/:referenceId', (req, res) => {
  try {
    const { referenceId } = req.params;
    const { requesterId, isAdmin } = req.query as { requesterId?: string; isAdmin?: string };

    const grievance = getGrievanceByRef(referenceId);
    if (!grievance) {
      return res.status(404).json({ error: `No grievance found with reference ID ${referenceId}` });
    }

    // Mask PII if not owner and not admin (Scenario 12 Privacy Guard)
    const isAuthorized = isAdmin === 'true' || (requesterId && requesterId === grievance.userId);
    const sanitized = isAuthorized
      ? grievance
      : {
          ...grievance,
          userName: grievance.userName ? grievance.userName.slice(0, 3) + '*****' : 'Citizen',
          userEmail: grievance.userEmail ? grievance.userEmail.slice(0, 2) + '***@' + (grievance.userEmail.split('@')[1] || 'gov.in') : 'Protected',
          isProtectedView: true,
        };

    const history = getHistoryByRef(referenceId);

    return res.json({
      success: true,
      data: sanitized,
      history,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to retrieve grievance' });
  }
});

// Get chronological status history
apiRouter.get('/grievances/:referenceId/history', (req, res) => {
  try {
    const { referenceId } = req.params;
    const history = getHistoryByRef(referenceId);
    return res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to retrieve history' });
  }
});

// Update grievance status (Admin Only)
apiRouter.patch('/grievances/:referenceId/status', (req, res) => {
  try {
    const { referenceId } = req.params;
    const { status, note, updatedBy, resolutionNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = updateGrievance(referenceId, status, note, updatedBy, resolutionNotes);
    if (!updated) {
      return res.status(404).json({ error: `Grievance ${referenceId} not found` });
    }

    return res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to update status' });
  }
});

// Submit citizen post-resolution feedback
apiRouter.post('/grievances/:referenceId/feedback', (req, res) => {
  try {
    const { referenceId } = req.params;
    const { userId, rating, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const fb = addGrievanceFeedback(referenceId, userId || 'citizen', rating, comments || '');
    return res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: fb,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to save feedback' });
  }
});

// ==========================================
// 3. SERVICES CATALOG & ANALYTICS ENDPOINTS
// ==========================================

apiRouter.get('/services', (req, res) => {
  try {
    const { category, search } = req.query as { category?: string; search?: string };
    let list = [...VERIFIED_SERVICES];

    if (category && category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          (s.teluguName && s.teluguName.includes(q)) ||
          (s.hindiName && s.hindiName.includes(q)) ||
          s.department.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to list services' });
  }
});

apiRouter.get('/admin/analytics', (req, res) => {
  try {
    const analytics = getAnalytics();
    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to get analytics' });
  }
});
