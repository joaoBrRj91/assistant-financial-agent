require('dotenv').config()

const express = require('express')
const cors = require('cors')
const chatRouter = require('./routes/chat')
const analyticsRouter = require('./routes/analytics')

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json())
app.use('/api', chatRouter)
app.use('/api', analyticsRouter)

app.listen(PORT, () => {
  console.log(`FinBot backend running on port ${PORT}`)
  console.log(`Accepting requests from: ${FRONTEND_ORIGIN}`)
  console.log(`LLM provider: ${process.env.LLM_PROVIDER || 'anthropic'}`)
})
