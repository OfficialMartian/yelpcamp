const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage });


const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCamp } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router.route('/')
    // shows all campgrounds
    .get(catchAsync(campgrounds.showAllCamps))
    // posts new camp data into database and redirects to show
    .post(isLoggedIn, upload.array('image'), validateCamp, catchAsync(campgrounds.createNewCamp));


// form for new camp
router.get('/new', isLoggedIn, campgrounds.newCampForm);


router.route('/:id')
    // Shows individual camp
    .get(catchAsync(campgrounds.showOneCamp))
    // Updates and shows details after editing
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCamp, catchAsync(campgrounds.updateCamp))
    // Delete Camp
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp));

// Form to edit a campground's details
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm))

module.exports = router;