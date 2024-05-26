import { Document, Schema, model } from 'mongoose';

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  location: string;
  [key: string]: any;  // Add this line to allow dynamic property access
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  birthday: { type: Date, required: true },
  location: { type: String, required: true }
});

const User = model<IUser>('User', userSchema);

export default User;
export { IUser };

