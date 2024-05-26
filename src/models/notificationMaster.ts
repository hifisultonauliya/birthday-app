import { Document, Schema, model } from 'mongoose';

interface INotificationMaster extends Document {
  name: string;
  repeat: string; // daily / monthly / yearly / empty means no repeat one time based on the dateTime.
  dateTime: Date; //time only will be used if userFieldName is not empty
  userFieldName: string; //if this not empty, dateTime will be replace based on the userFieldName (time still use dateTime) unles field not exist in userModel (limited to userModel right now)
  templateMessage: string; //right now only {fullname} will be used and replace by it own fullname
  [key: string]: any;  // Add this line to allow dynamic property access
}

const notificationMasterSchema = new Schema<INotificationMaster>({
  name: { type: String, required: true },
  repeat: { type: String, required: true },
  dateTime: { type: Date, required: true },
  userFieldName: { type: String },
  templateMessage: { type: String, required: true }
});

const NotificationMaster = model<INotificationMaster>('NotificationMaster', notificationMasterSchema);

export default NotificationMaster;
export { INotificationMaster };

