import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleAnalyzeIssue, handleCommunitySummary } from './src/server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies with up to 20MB limit for image analysis
app.use(express.json({ limit: '20mb' }));

// Health check endpoint for Cloud Run
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'CivicLens AI',
    time: new Date().toISOString(),
  });
});

// Gemini-powered issue analysis
app.post('/api/analyze-issue', async (req, res) => {
  try {
    const analysis = await handleAnalyzeIssue(req.body);
    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing issue:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze civic issue with Gemini.',
    });
  }
});

// Gemini-powered community insights summary
app.post('/api/insights-summary', async (req, res) => {
  try {
    const summary = await handleCommunitySummary(req.body.reports || []);
    res.json(summary);
  } catch (error: any) {
    console.error('Error generating community summary:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate community summary with Gemini.',
    });
  }
});

// Serve frontend static build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other GET routes to index.html for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CivicLens AI server listening on port ${PORT}`);
});
