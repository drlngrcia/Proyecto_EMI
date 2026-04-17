import { Request, Response, Router } from 'express';
import { UserRepository } from '../repositories/users.repository';

const userRepository = new UserRepository();

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const existing = await userRepository.findByEmail(req.body.email);
      if (existing) return res.status(400).json({ message: 'El correo ya está registrado' });
      
      const user = await userRepository.create(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const router = Router();
const userController = new UserController();

router.get('/', (req, res) => userController.getAll(req, res));
router.post('/', (req, res) => userController.create(req, res));

export default router;
