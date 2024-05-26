import { Router } from 'express';
import { createUser, deleteUser, getAllUsers, updateUser } from '../controllers/userController';

const router = Router();

router.get('/user', getAllUsers);
router.post('/user', createUser);
router.delete('/user/:id', deleteUser);
router.put('/user/:id', updateUser); // Bonus: Update user

export default router;
