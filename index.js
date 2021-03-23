// Dependencies
require('module-alias/register')
const express = require('express')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const passport = require('passport')
const bodyParser = require('body-parser')
const { mongoURI, cookieKey } = require('@config/keys')
const path = require('path')

// DB and Passport
require('@models/User')
require('@models/Blog')
require('@services/cache')
require('@services/passport')

// Routes
const setupAuthRoutes = require('@routes/authRoutes')
const setupBlogRoutes = require('@routes/blogRoutes')

// Server and DB Settings
mongoose.Promise = global.Promise
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
const app = express()

// Server middleware
app.use(express.json())
app.use(cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000,
  keys: [cookieKey]
}))
app.use(passport.initialize())
app.use(passport.session())

// Server Routes
setupAuthRoutes(app)
setupBlogRoutes(app)

// Production-only settings
if (['production', 'ci'].includes(process.env.NODE_ENV)) {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => res.sendFile(path.resolve('client', 'build', 'index.html')))
}

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port`, PORT))
