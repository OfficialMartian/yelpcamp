const Campground = require('../models/campground');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxtoken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({ accessToken: mbxtoken });
const { cloudinary } = require("../cloudinary");

module.exports.showAllCamps = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.newCampForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCamp = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash('success', 'Successfully created a campground');
    res.redirect(`campgrounds/${camp._id}`);
}

module.exports.showOneCamp = async(req, res) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(camp);
    if (!camp) {
        req.flash('error', 'Cannot find the Campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}

module.exports.editForm = async(req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash('error', 'Cannot find the Campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}

module.exports.updateCamp = async(req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully edited a campground');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCamp = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
}