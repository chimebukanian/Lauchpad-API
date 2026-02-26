// controllers for ideas including filtering/sorting/trending

async function createIdea(req, res, next) {
  const { title, description, categoryId } = req.body;
  if (!title || !description || !categoryId) {
    return res.status(400).json({ error: 'title, description and categoryId required' });
  }
  try {
    const idea = await req.prisma.idea.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        userId: req.user.id,
      },
    });
    res.status(201).json(idea);
  } catch (err) {
    next(err);
  }
}

async function getIdea(req, res, next) {
  const { id } = req.params;
  try {
    const idea = await req.prisma.idea.findUnique({
      where: { id: parseInt(id) },
      include: { votes: true, comments: true, category: true, user: { select: { id: true, email: true, name: true } } },
    });
    if (!idea) return res.status(404).json({ error: 'Idea not found' });
    // compute vote count
    idea.voteCount = idea.votes.length;
    res.json(idea);
  } catch (err) {
    next(err);
  }
}

// list with filters and sorting
async function listIdeas(req, res, next) {
  const { category, sortBy, page = 1, limit = 20, trending } = req.query;
  const where = {};
  if (category) {
    where.category = { name: category };
  }

  const orderBy = [];

  if (trending === 'true') {
    // trending by recent vote count (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    orderBy.push({ votes: { _count: 'desc' } });
    where.votes = { some: { createdAt: { gte: weekAgo } } };
  } else if (sortBy === 'votes') {
    orderBy.push({ votes: { _count: 'desc' } });
  } else if (sortBy === 'recent') {
    orderBy.push({ createdAt: 'desc' });
  } else {
    // default by createdAt desc
    orderBy.push({ createdAt: 'desc' });
  }
  try {
    const ideas = await req.prisma.idea.findMany({
      where,
      include: { votes: true, comments: true, category: true, user: { select: { id: true, name: true } } },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });
    const formatted = ideas.map(i => ({
      ...i,
      voteCount: i.votes.length,
      commentCount: i.comments.length,
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
}

async function updateIdea(req, res, next) {
  const { id } = req.params;
  const { title, description, categoryId } = req.body;
  try {
    const idea = await req.prisma.idea.findUnique({ where: { id: parseInt(id) } });
    if (!idea) return res.status(404).json({ error: 'Idea not found' });
    if (idea.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await req.prisma.idea.update({
      where: { id: parseInt(id) },
      data: {
        title: title || idea.title,
        description: description || idea.description,
        categoryId: categoryId ? parseInt(categoryId) : idea.categoryId,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteIdea(req, res, next) {
  const { id } = req.params;
  try {
    const idea = await req.prisma.idea.findUnique({ where: { id: parseInt(id) } });
    if (!idea) return res.status(404).json({ error: 'Idea not found' });
    if (idea.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await req.prisma.idea.delete({ where: { id: parseInt(id) } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createIdea,
  getIdea,
  listIdeas,
  updateIdea,
  deleteIdea,
};