// CRUD for categories
async function listCategories(req, res, next) {
  try {
    const cats = await req.prisma.category.findMany();
    res.json(cats);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const cat = await req.prisma.category.create({ data: { name } });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    next(err);
  }
}

async function updateCategory(req, res, next) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const cat = await req.prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(cat);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  const { id } = req.params;
  try {
    await req.prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
