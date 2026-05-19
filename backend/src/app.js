const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const alertRoutes = require('./routes/alert.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const historyRoutes = require('./routes/history.routes');
const messageRoutes = require('./routes/message.routes');
const pictogramRoutes = require('./routes/pictogram.routes');
const routineRoutes = require('./routes/routine.routes');
const userRoutes = require('./routes/user.routes');
const workshopRoutes = require('./routes/workshop.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'altercom-api',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pictograms', pictogramRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route introuvable.'
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur.';

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details: error.details || null
  });
});

module.exports = app;
