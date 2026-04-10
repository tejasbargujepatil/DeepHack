const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../utils/validators');

router.post('/register',       validate(registerSchema), authController.register);
router.post('/register-admin',                           authController.registerAdmin);
router.post('/login',          validate(loginSchema),    authController.login);
router.post('/logout',                                   authController.logout);
router.post('/refresh',                                  authController.refreshToken);

module.exports = router;

