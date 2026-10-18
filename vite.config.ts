import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import {
  handleAnalyzeIssue,
  handleCommunitySummary,
  handleTranscribeAudio,
  handleChat,
  handleMapsCivicLookup,
} from './src/server/api.ts';

dotenv.config();

function civicLensDevApiPlugin(): Plugin {
  return {
    name: 'civiclens-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);

        if (url.pathname === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
          return;
        }

        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', chunk => chunks.push(Buffer.from(chunk)));
          req.on('end', async () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf-8');
              const parsed = bodyStr ? JSON.parse(bodyStr) : {};

              if (url.pathname === '/api/analyze-issue') {
                const analysis = await handleAnalyzeIssue(parsed);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(analysis));
                return;
              }

              if (url.pathname === '/api/insights-summary') {
                const summary = await handleCommunitySummary(parsed.reports || []);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(summary));
                return;
              }

              if (url.pathname === '/api/transcribe-audio') {
                const { audioBase64, mimeType } = parsed;
                const result = await handleTranscribeAudio(audioBase64, mimeType);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                return;
              }

              if (url.pathname === '/api/chat') {
                const result = await handleChat(parsed.messages || []);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                return;
              }

              if (url.pathname === '/api/maps-lookup') {
                const result = await handleMapsCivicLookup(parsed.query || '', parsed.location);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
                return;
              }

              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Not found: ${url.pathname}` }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), civicLensDevApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
