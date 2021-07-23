const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0 ; i < 50; i++){
        const random1000 =  Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60e8c1ee021f8e1123ebaa9d',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddqo49buw/image/upload/v1626421614/YelpCamp/veuk03x60lbt3klq1up5.jpg',
                    filename: 'YelpCamp/veuk03x60lbt3klq1up5'
                },
                {   
                    url:'https://res.cloudinary.com/ddqo49buw/image/upload/v1626422672/YelpCamp/mqb9dnbtb4vt07u3txkq.jpg',
                    filename:'YelpCamp/mqb9dnbtb4vt07u3txkq.jpg'
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste tenetur veritatis quis aspernatur asperiores explicabo repudiandae quibusdam velit praesentium deleniti officiis maxime voluptatibus dolorem eos reiciendis fugiat provident, autem incidunt.Pariatur temporibus, esse dignissimos, eum, suscipit recusandae blanditiis nulla corrupti voluptates quisquam impedit voluptate delectus unde ad ea corporis dolorem assumenda quod ex! Nobis enim inventore sed voluptatum hic aliquam!',
            price: price
        });
        await camp.save();
    }
}

seedDB().then(() => {mongoose.connection.close()});