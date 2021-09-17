const router = require('express').Router();
const { User, Post, Tags } = require('../models');
const withAuth = require('../utils/auth');

// Gets all the posts and passes them to the handlebars renderer
router.get('/', withAuth, async (req, res) => {
  try {
    const dbPostData = await Post.findAll({
      where: {
        user_id: req.session.user_id,
      },
      attributes: ['id', 'title', 'content', 'post_tags', 'date_created'],
      include: [
        {
          model: Tags,
          attributes: [
            'id',
            'category',
            'post_tags',
            'user_id',
            'post_id',
            'created_at',
          ],
          include: {
            model: User,
            attributes: ['username'],
          },
        },
      ],
    });

    const posts = dbPostData.map((post) => post.get({ plain: true }));

    res.render('dashboard', { posts, logged_in: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Gets the info needed for one post for editing and passes them to the handlebars renderer
router.get('/edit/:id', withAuth, async (req, res) => {
  try {
    const dbPostData = await Post.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ['id', 'title', 'content', 'post_tags', 'date_created'],
      include: [
        {
          model: User,
          attributes: ['username'],
        },
        {
          model: Tags,
          attributes: [
            'id',
            'category',
            'post_tags',
            'user_id',
            'post_id',
            'created_at',
          ],
          include: {
            model: User,
            attributes: ['username'],
          },
        },
      ],
    });

    if (!dbPostData) {
      res.status(404).json({ message: 'No post found with this id' });
      return;
    }

    const post = dbPostData.get({ plain: true });
    res.render('edit-post', { post, logged_in: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Gets all users from the database
router.get('/users', withAuth, async ({ res }) => {
  try {
    const dbUserData = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    const users = dbUserData.map((user) => user.get({ plain: true }));

    res.render('users', { users, logged_in: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Calls the new dashboard route to create new posts
router.get('/new', withAuth, ({ res }) => {
  res.render('new-post', { logged_in: true });
});

module.exports = router;
