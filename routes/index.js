var express = require('express');
var router = express.Router();
const User = require("../model/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = require('../model/userModel');
passport.use(new LocalStrategy(User.authenticate()));
var upload = require("../utils/multer");
const postModel=require("../model/postMode")


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', function (req, res, next) {
  res.render('signup', { error: req.flash('error') })

})


router.get('/back', function (req, res, next) {
  res.redirect('/setting');
});

router.get('/backout', function (req, res, next) {
  res.redirect('/profile');
});


router.get('/return', function (req, res, next) {
  res.redirect('/signin');
});
router.get('/returns', function (req, res, next) {
  res.redirect('/forget');
});


router.post("/signup", async function (req, res, next) {
  const { username, email } = req.body;
  const userDate = new userModel({ username, email });

  userModel.register(userDate, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {

        res.redirect("/signin")
        failureFlash: true


      })
    })
});


router.get('/signin', function (req, res, next) {
  res.render('signin', { error: req.flash('error') })
})

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
    failureFlash: true
  }),
  function (req, res, next) { }
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('profile', { user })
});



router.get("/signout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/signin");
  });
});

router.get('/reset', isLoggedIn, function (req, res, next) {
  res.render('reset', { rohit: req.user });
});

router.post('/reset', isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword,
    )
    await req.user.save();
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/signin");
  }
}


router.get("/forget", function (req, res, next) {
  res.render("forget", { admin: req.user });
});

router.post("/send-mail", async function (req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.send("User Not Found! <a href='/forget'>Try Again</a>");

    sendmail(user.email, user, res, req);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post("/forget/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.send("User not found! <a href='/forget'>Try Again</a>.");

    if (user.token == req.body.token) {
      user.token = -1;
      await user.setPassword(req.body.newpassword);
      await user.save();
      res.redirect("/signin");
    } else {
      user.token = -1;
      await user.save();
      res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
    }
  } catch (error) {
    res.send(error);
  }
});



router.get('/feed', function (req, res, next) {
  res.render('feed');
});

router.get('/setting', function (req, res, next) {
  res.render('setting');
});

router.get("/setting", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('setting', { user })
});



router.post("/upload", upload.single("file"), isLoggedIn, async function (req, res, next) {
  if (!req.file) {
    return res.status(404).send("no file uploaded")
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });
  user.posts.push(post._id);
  await user.save()
  res.redirect("/profile")
});

module.exports = router;
