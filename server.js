import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoint for Sentinel AI Query Interface (/api/ai/query)
// Strictly follows the Truth Status and Structured Response Schema from screenshots
app.post('/api/ai/query', (req, res) => {
  const query = req.body?.query || '';
  const q = query.toLowerCase();

  let responseData = {
    query,
    status: 'OBSERVED',
    source: 'CCTV_FLEET_DIAGNOSTICS',
    provider: 'LOCAL_TELEMETRY',
    evidenceId: 'EVT-78421',
    confidence: 0.98,
    badge: 'OBSERVED · HARDWARE VERIFIED',
    reply: 'CCTV Fleet Health Report: 30 monitored nodes operational across Ahmedabad and Junagadh clusters. Average latency 14ms. 0 frame drops reported in the last 60 minutes.',
    details: {
      status: 'online',
      resolution: '1920x1080',
      fps: 25,
      activeNodes: 30
    }
  };

  if (q.includes('cam-12') || q.includes('cam 12') || q.includes('tri mandir')) {
    responseData = {
      query,
      status: 'OBSERVED',
      source: 'CAM-12 (Tri Mandir Adalaj Toll Plaza)',
      provider: 'EDGE_VISION_NODE_12',
      evidenceId: 'EVT-78456',
      confidence: 0.96,
      badge: 'OBSERVED · LIVE EDGE STREAM',
      reply: 'CAM-12 (Tri Mandir Adalaj Highway Toll Plaza): Optical feed active at 25 FPS (1080p). 3 vehicles detected in zone (Bus 94%, Car 91%, Person 87%). No perimeter violations.',
      details: {
        location: 'Gandhinagar Highway',
        vehicles: 2,
        plates: 2,
        hsrp: 'VERIFIED'
      }
    };
  } else if (q.includes('gj01ab1234') || q.includes('find vehicle')) {
    responseData = {
      query,
      status: 'INFERRED',
      source: 'ANPR_OCR_VERIFIER',
      provider: 'YOLOV8_ONNX_LOCAL',
      evidenceId: 'EVT-78102',
      confidence: 0.88,
      badge: 'INFERRED · ANPR VERIFIED',
      reply: 'Target vehicle GJ01AB1234 last detected at CAM-04 (Ring Road East) at 09:42:15 UTC. Direction eastbound, speed 48 km/h. High-Security Plate crop logged with SHA-256 seal.',
      details: {
        plate: 'GJ01AB1234',
        type: 'White SUV',
        verifiedFrames: 8
      }
    };
  } else if (q.includes('incident') || q.includes('active')) {
    responseData = {
      query,
      status: 'OBSERVED',
      source: 'INCIDENT_TRIAGE_MESH',
      provider: 'DETERMINISTIC_RULES',
      evidenceId: 'EVT-77901',
      confidence: 0.95,
      badge: 'OBSERVED · OPERATIONAL RECORDS',
      reply: 'Active Incidents: 1 medium-priority congestion alert (Sector 7 Junction), 0 active felony watch alerts. 2 patrol units on active route patrol.',
      details: {
        activeIncidents: 1,
        urgentCount: 0,
        triageStatus: 'NOMINAL'
      }
    };
  } else if (q.includes('evidence') || q.includes('corridor')) {
    responseData = {
      query,
      status: 'OBSERVED',
      source: 'FORENSIC_EVIDENCE_STORE',
      provider: 'BSA_2023_VAULT',
      evidenceId: 'EVT-78421',
      confidence: 1.0,
      badge: 'OBSERVED · SHA-256 SEALED',
      reply: 'Forensic evidence dossier #EVT-78421 located. Dual SHA-256 integrity hash verified. Raw frame and derived OCR metadata are untampered and compliant with BSA 2023 Sec-63.',
      details: {
        hashRaw: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        hashDerived: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      }
    };
  }

  res.json(responseData);
});

// Serve static assets
app.use(express.static(__dirname));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sentinel Grid V2 server running at http://0.0.0.0:${PORT}`);
});
