const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { vote, unvote } = require('../controllers/votesController');

router.post('/', auth, vote);
router.delete('/', auth, unvote);

module.exports = router;
