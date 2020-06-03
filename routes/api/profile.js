const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log(user);
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile
// @desc    Create & update user profile
// @access  Private
router.post(
  "/",
  auth,
  [
    check("status", "status is require").not().isEmpty(),
    check("skills", "skill is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;

    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFields,
          },
          {
            new: true,
          }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(e);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile/user/:user_id
// @desc    Get  profile by user id
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.json(profile);
  } catch (e) {
    console.error(e.message);
    if (e.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user &posts
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    // await Profile.findOneAndDelete({ user: req.user.id });
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: "user deleted" });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/experince
// @desc    Add profile experince
// @access  Private
router.post(
  "/experience",
  auth,
  [
    check("title", "Title is required").not().isEmpty(),
    check("company", "Company is required").not().isEmpty(),
    check("from", "From is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      await profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/profile/experince/:exp_id
// @desc    Delete profile experince
// @access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    console.log(removeIndex);
    if (removeIndex < 0) {
      res
        .status(400)
        .json({ error: "There is no such an experience in this profile" });
    }
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (e) {
    console.error(e.message);

    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.post(
  "/education",
  auth,
  [
    check("school", "School is required").not().isEmpty(),
    check("degree", "Degree is required").not().isEmpty(),
    check("fieldofstudy", "Fieldofstudy is required").not().isEmpty(),
    check("from", "From is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      await profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile expeeducationrince
// @access  Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    console.log(removeIndex);
    if (removeIndex < 0) {
      res
        .status(400)
        .json({ error: "There is no such an education in this profile" });
    }
    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (e) {
    console.error(e.message);

    res.status(500).send("Server Error");
  }
});
module.exports = router;
