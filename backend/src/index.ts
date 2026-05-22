import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import authRoutes from './routes/auth.routes.js';
import authorRoutes from './routes/author.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const httpServer = createServer(app);

// initialize socket with httpServer
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'BookLeaf API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();