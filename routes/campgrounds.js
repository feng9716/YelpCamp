const express = require('express');
const router = express.Router();
const catchAsync = require('../util/catchAsync')
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const {storage} = require('../cloudinary/index.js');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    // Make new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create));

//Put this above :id to avoid error 
router.get('/new', isLoggedIn, campgrounds.newForm);

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    // Update a campground
    .put(isLoggedIn, isAuthor,upload.array('image'),validateCampground, catchAsync(campgrounds.update))
    // Delete a campGround
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.delete));
    
// Enter edit form
router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(campgrounds.editPage))

module.exports = router;