const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addComment,
  listComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentsController');

router.get('/', listComments);
router.post('/', auth, addComment);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
