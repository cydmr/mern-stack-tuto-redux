const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  "/",
  auth,
  [check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array });
    }
    try {
      console.log(req.user.id);
      const user = await User.findById(req.user.id);
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.send(post);
    } catch (e) {
      console.log(e.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:post_id
// @desc    Get  post by id
// @access  Private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (e) {
    console.error(e.message);
    if (e.kind === "ObjectID") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/post/:post_id
// @desc    Delete post
// @access  Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    console.log({ post });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "You are not allowed to delete this post" });
    }
    await post.remove();
    res.json({ msg: "Post removed successfully" });
  } catch (e) {
    console.error(e.message);
    if (e.kind === "ObjectID") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/post/like/:id
// @desc    Like a post
// @access  Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post is alredy liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/post/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not been liked" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/posts/comment/post_id
// @desc    Comment on a post
// @access  Private
router.post(
  "/comments/:post_id",
  auth,
  [check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array });
    }
    try {
      const user = await User.findById(req.user.id);
      const post = await Post.findById(req.params.post_id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.send(post.comments);
    } catch (e) {
      console.log(e.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/post/comment/:post_id/:com_id
// @desc    Delete a comment on a post
// @access  Private
router.delete("/comments/:post_id/:com_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    const comment = post.comments.find(
      (comment) => comment.id === req.params.com_id
    );
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "You are not allowed to delete this comment" });
    }

    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
