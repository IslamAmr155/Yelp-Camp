const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor,validateCampground} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn('create a campground'), upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn('create a campground'), campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn('edit a campground'), isAuthor('edit'), upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete (isLoggedIn('delete a campground'), isAuthor('delete'), catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn('edit a campground'), isAuthor('edit'), catchAsync(campgrounds.renderEditForm));

module.exports = router;