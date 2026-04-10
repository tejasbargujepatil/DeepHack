const express = require('express');
const router  = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth');

// Optional auth — if token present, inject user; otherwise continue as guest
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/chat', optionalAuth, aiController.chatbotQuery);
router.get('/recommendations', aiController.getRecommendations);

module.exports = router;
