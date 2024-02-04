import express from 'express';
import app from '../app';
import AuthController from '../controllers/AuthController';

const router = express.Router();

const authController = new AuthController();

// router.post('/register', authController.register);

router.post('/register', (req, res) => authController.register(req, res));

// note
// 1. if we call like this authController.register, the value of this will point to
// this context router.post('/register', authController.register);
// 2, if we want this to point to AuthController class we can use arrow function

export default router;
