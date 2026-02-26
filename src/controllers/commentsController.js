// comment logic

async function addComment(req, res, next) {
  const { ideaId, content } = req.body;
  if (!ideaId || !content) return res.status(400).json({ error: 'ideaId and content required' });
  try {
    const comment = await req.prisma.comment.create({
      data: {
        content,
        ideaId: parseInt(ideaId),
        userId: req.user.id,
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

async function listComments(req, res, next) {
  const { ideaId } = req.query;
  const where = {};
  if (ideaId) where.ideaId = parseInt(ideaId);
  try {
    const comments = await req.prisma.comment.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

async function updateComment(req, res, next) {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  try {
    const comment = await req.prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await req.prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  const { id } = req.params;
  try {
    const comment = await req.prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await req.prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { addComment, listComments, updateComment, deleteComment };
