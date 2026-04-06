const Post    = require("../models/Post");
const Comment = require("../models/Comment");

const AUTHOR_SELECT = "firstName lastName";

// ── Helpers ──────────────────────────────────────────────────────────────────

const enrichPost = (post, userId) => {
  const p = post.toObject();
  p.likeCount  = p.likes.length;
  p.likedByMe  = p.likes.map(String).includes(String(userId));
  return p;
};

// ── POST /api/posts ───────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  const { content, image, visibility } = req.body;
  try {
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const post = await Post.create({
      author: req.user._id,
      content,
      image:      image      || null,
      visibility: visibility || "public",
    });

    await post.populate("author", AUTHOR_SELECT);
    res.status(201).json(enrichPost(post, req.user._id));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/posts ────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { visibility: "public" },
        { visibility: "private", author: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", AUTHOR_SELECT);

    res.json(posts.map((p) => enrichPost(p, req.user._id)));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/posts/:id/like ──────────────────────────────────────────────────
exports.togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid    = String(req.user._id);
    const idx    = post.likes.map(String).indexOf(uid);
    const liked  = idx === -1;

    if (liked) post.likes.push(req.user._id);
    else        post.likes.splice(idx, 1);

    await post.save();
    res.json({ liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};