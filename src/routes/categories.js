const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoriesController');

// anyone can read
router.get('/', listCategories);
// only admin can create/update/delete
router.post('/', auth, role(['ADMIN']), createCategory);
router.put('/:id', auth, role(['ADMIN']), updateCategory);
router.delete('/:id', auth, role(['ADMIN']), deleteCategory);

module.exports = router;
