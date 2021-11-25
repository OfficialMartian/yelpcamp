const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, "DB Connection Error\n"))
db.once('open', () => {
    console.log('DB Connection Success');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; ++i) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100);
        const camp = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Quidem quo tempore ut officia ipsa praesentium cupiditate distinctio expedita eaque cumque repellat repellendus incidunt, illum dolorem impedit suscipit voluptatem quasi quod!',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
            },
            author: '618f9fb7ace74acda2cbebac',
            images: [{
                    url: 'https://res.cloudinary.com/di2xvj7s1/image/upload/v1636973959/YelpCamp/jnwcxmcbklbhvqkagdoo.jpg',
                    filename: 'YelpCamp/jnwcxmcbklbhvqkagdoo',
                },
                {
                    url: 'https://res.cloudinary.com/di2xvj7s1/image/upload/v1636973959/YelpCamp/xojwoiyrqzzyt7vsats9.jpg',
                    filename: 'YelpCamp/xojwoiyrqzzyt7vsats9',
                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});