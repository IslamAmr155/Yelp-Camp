const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor,validateCampground} = require('../middleware');

router.get('/', catchAsync( async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

router.get('/new', isLoggedIn('create a campground'), (req,res) => {
    res.render('campgrounds/new');
});

router.post('/', isLoggedIn('create a campground'), validateCampground, catchAsync( async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.get('/:id', catchAsync( async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({path:'reviews', populate: {path: 'author'}}).populate('author');
    if (!campground)
    {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}));

router.get('/:id/edit', isLoggedIn('edit a campground'), isAuthor('edit'), catchAsync( async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', isLoggedIn('edit a campground'), isAuthor('edit'), validateCampground, catchAsync( async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete ('/:id', isLoggedIn('delete a campground'), isAuthor('delete'), catchAsync( async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id))
    {
        req.flash('error', 'You do not have permission to delete this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}));

module.exports = router;