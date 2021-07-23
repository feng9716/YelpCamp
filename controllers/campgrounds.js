const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary/index.js');

module.exports.index = async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.newForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.show = async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id)
    .populate(
    {
        path:'reviews',
        populate: {
            path:'author'
        }
    }
    ).populate('author'); 

    if(!camp){
        req.flash('error', 'The camp is not listed anymore');
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{camp});
}

module.exports.create = async (req,res,next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;

    camp.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    // Add the _id as the author
    camp.author = req.user._id;
    await camp.save();
    
    console.log(camp);

    req.flash('success', 'Camp added successfully');
    res.redirect(`/campgrounds/${camp._id}`);
    
};

module.exports.editPage = async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);

    // Check if the camp is still in our database
    if(!camp){
        req.flash('error', 'The camp is not listed anymore');
        res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit.ejs',{camp});
};

module.exports.update = async (req,res,next) => {
    // res.send("IT WORKED!");
    const {id} = req.params;

    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));

    camp.images.push(...imgs);
    await camp.save();

    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        console.log(camp);
    }
    
    req.flash('success', "Successfully updated campground");
    res.redirect(`/campgrounds/${camp._id}`);
    
};

module.exports.delete =async(req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully delete campground");
    res.redirect('/campgrounds');
};