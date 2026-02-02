import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password !== config.appPassword) {
    return res.status(401).json({ error: 'Falsches Passwort' });
  }

  const token = jwt.sign({ authenticated: true }, config.jwtSecret, {
    expiresIn: '24h',
  });

  res.json({ token });
});

export default router;
