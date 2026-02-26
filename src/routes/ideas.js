const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createIdea,
  getIdea,
  listIdeas,
  updateIdea,
  deleteIdea,
} = require('../controllers/ideasController');

// public endpoints
router.get('/', listIdeas);
router.get('/:id', getIdea);

// protected
router.post('/', auth, createIdea);
router.put('/:id', auth, updateIdea);
router.delete('/:id', auth, deleteIdea);

module.exports = router;
