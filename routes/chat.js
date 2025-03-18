const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Ruta za prikaz svih poruka
router.get('/', authenticateToken, chatController.getUserMessages);

// Ruta za slanje poruka
router.post('/send', authenticateToken, chatController.sendMessage);

router.get('/partners', authenticateToken, chatController.getChatPartners);

router.post('/start', authenticateToken, chatController.startNewConversation);

router.get('/messages/:userId', authenticateToken, chatController.getMessagesWithPartner);

router.delete('/delete/:partnerId', authenticateToken, chatController.deleteChat);

module.exports = router;
