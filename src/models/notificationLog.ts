import { Document, Schema, Types, model } from 'mongoose';
import { INotificationQueue } from './notificationQueue';

interface INotificationLog extends Document {
  notificationQueue: Types.ObjectId | INotificationQueue;
  dateNotification: Date;
  nextDateNotification?: Date;
  status: string; // e.g., success, pending, failed
  error?: string; // optional field to store error messages if any
  createdDate: Date;
  [key: string]: any;  // Add this line to allow dynamic property access
}

const notificationLogSchema = new Schema<INotificationLog>({
  notificationQueue: { type: Schema.Types.ObjectId, ref: 'NotificationQueue', required: true },
  dateNotification: { type: Date, required: true },
  nextDateNotification: { type: Date }, // optional
  status: { type: String, required: true },
  createdDate: { type: Date, required: true },
  error: { type: String } // optional
});

const NotificationLog = model<INotificationLog>('NotificationLog', notificationLogSchema);

export default NotificationLog;
export { INotificationLog };

