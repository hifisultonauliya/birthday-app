import { Document, Schema, Types, model } from 'mongoose';
import { INotificationMaster } from './notificationMaster';
import { IUser } from './user';

interface INotificationQueue extends Document {
  user: Types.ObjectId | IUser;
  notificationMaster: Types.ObjectId | INotificationMaster;
  dateNotification: Date;
  dateNotificationLocalTime: string;
  lastStatus: string; //success, pending, failed
  repeat: number; // to track the number of times the notification has been repeated
  repeatInterval: string;
  templateMessage: string;
  location: string;
  [key: string]: any;  // Add this line to allow dynamic property access
}

const notificationQueueSchema = new Schema<INotificationQueue>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notificationMaster: { type: Schema.Types.ObjectId, ref: 'NotificationMaster', required: true },
  dateNotification: { type: Date, required: true },
  dateNotificationLocalTime: { type: String, required: true },
  lastStatus: { type: String, required: true },
  repeat: { type: Number, default: 0 }, // initialize with 0 for no repeat
  repeatInterval: { type: String, required: true },
  templateMessage: { type: String, required: true },
  location: { type: String, required: true },
});

const NotificationQueue = model<INotificationQueue>('NotificationQueue', notificationQueueSchema);

export default NotificationQueue;
export { INotificationQueue };

