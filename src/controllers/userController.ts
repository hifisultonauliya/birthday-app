import { Request, Response } from 'express';
import NotificationMaster from '../models/notificationMaster';
import NotificationQueue from '../models/notificationQueue';
import User from '../models/user';
import { generateNotificationQueue } from '../services/notificationService';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve users', error });
    }
  };

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, birthday, location } = req.body;
    const user = new User({ firstName, lastName, email, birthday, location });
    await user.save();

    // generate NotificationQueue
    // get all notification master
    const notificationMasters = await NotificationMaster.find();
    for (const notificationMaster of notificationMasters) {
      await generateNotificationQueue(user, notificationMaster)
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    
    // remove NotificationQueue
    await NotificationQueue.deleteMany({ user: id });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Bonus: Update user details
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, birthday, location } = req.body;
    const user = await User.findById(id);
    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.birthday = birthday;
      user.location = location;
      await user.save();

      // re-generate NotificationQueue

      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};
