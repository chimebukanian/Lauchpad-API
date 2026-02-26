// vote controller

async function vote(req, res, next) {
  const { ideaId } = req.body;
  if (!ideaId) return res.status(400).json({ error: 'ideaId required' });
  try {
    // check if existing vote
    const existing = await req.prisma.vote.findUnique({
      where: { userId_ideaId: { userId: req.user.id, ideaId: parseInt(ideaId) } },
    });
    if (existing) {
      return res.status(400).json({ error: 'User has already voted' });
    }
    const vote = await req.prisma.vote.create({
      data: { ideaId: parseInt(ideaId), userId: req.user.id },
    });
    res.status(201).json(vote);
  } catch (err) {
    next(err);
  }
}

async function unvote(req, res, next) {
  const { ideaId } = req.body;
  if (!ideaId) return res.status(400).json({ error: 'ideaId required' });
  try {
    await req.prisma.vote.delete({ where: { userId_ideaId: { userId: req.user.id, ideaId: parseInt(ideaId) } } });
    res.json({ ok: true });
  } catch (err) {
    // if not found, ignore
    if (err.code === 'P2025') {
      return res.status(400).json({ error: 'Vote not found' });
    }
    next(err);
  }
}

module.exports = { vote, unvote };
