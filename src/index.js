const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// prisma client
const { PrismaClient } = require('@prisma/client');
// For Prisma v5 we instantiate without the `adapter` preview feature.
const prisma = new PrismaClient();

// routers
const authRouter = require('./routes/auth');
const ideasRouter = require('./routes/ideas');
const categoriesRouter = require('./routes/categories');
const commentsRouter = require('./routes/comments');
const votesRouter = require('./routes/votes');

const app = express();

// global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// attach prisma to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// routes
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/votes', votesRouter);

// 404 catch
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// error handler at end
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
