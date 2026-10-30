import { Router } from 'express';
import { handleChatQuery, handleGrievanceSuggestion } from './geminiHandler';

export const apiRouter = Router();

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
