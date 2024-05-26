import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import { initiateNotificationMasters } from './services/notificationService';
import scheduleBirthdayEmails from './services/schedulerService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', userRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    initiateNotificationMasters();
    scheduleBirthdayEmails();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
