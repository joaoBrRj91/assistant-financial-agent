const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

const VALID_STAGES = ['start', 'identification', 'diagnosis', 'organization', 'reserve', 'lead']

const INITIAL_DATA = {
  stages: Object.fromEntries(
    VALID_STAGES.map(s => [s, { uniqueUsers: 0, sessions: [] }])
  ),
  lastUpdated: new Date().toISOString(),
}

// Ensure data dir and file exist at module load
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}
if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(INITIAL_DATA, null, 2))
}

function readData() {
  return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'))
}

function writeData(data) {
  data.lastUpdated = new Date().toISOString()
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2))
}

// POST /api/analytics/stage
router.post('/analytics/stage', (req, res) => {
  const { sessionId, stage } = req.body

  if (!stage || !VALID_STAGES.includes(stage)) {
    return res.status(400).json({ error: 'Invalid stage' })
  }
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    return res.status(400).json({ error: 'Invalid sessionId' })
  }

  const data = readData()
  const entry = data.stages[stage]

  if (entry.sessions.includes(sessionId)) {
    return res.status(204).send()
  }

  entry.sessions.push(sessionId)
  entry.uniqueUsers = entry.sessions.length
  writeData(data)

  return res.status(204).send()
})

// GET /api/analytics/report
router.get('/analytics/report', (_req, res) => {
  const data = readData()
  const report = {
    stages: Object.fromEntries(
      Object.entries(data.stages).map(([key, val]) => [
        key,
        { uniqueUsers: val.uniqueUsers },
      ])
    ),
    lastUpdated: data.lastUpdated,
  }
  return res.status(200).json(report)
})

module.exports = router
