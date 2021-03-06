const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors())
app.use(express.json())

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

app.get('/', (request, response) => {
    response.send('SOLE SEARCHIN')
});

app.get('/api/v1/shoes', async (request, response) => {
    try {
        const shoes = await database('shoes').select();
        response.status(200).json(shoes);
    } catch (error) {
        response.status(500).json({
            error
        });
    }
});

// Get single shoe
app.get('/api/v1/shoes/:id', async (request, response) => {
    try {
        const shoeId = parseInt(request.params.id);
        const shoe = await database('shoes').where('id', shoeId).select();
        if(!shoe.length) {
            response.status(404).json("This shoe doesn't exist")
        } 
        response.status(200).json(shoe[0]);
    } catch (error) {
        response.status(500).json({error});
    }
});

// get comments
app.get('/api/v1/shoes/:id/comments', async (request, response) => {
    try {
        const shoeId = parseInt(request.params.id);
        const comments = await database('comments').where('shoe_id', shoeId).select();
        response.status(200).json(comments);
    } catch (error) {
        response.status(500).json({error});
    }
});

//post comments
app.post('/api/v1/shoes/:id/comments', async (request, response) => {
    const shoeId = parseInt(request.params.id);
    const comment = request.body;

    for (let requiredParam of ['author', 'main_text']) {
        if (!comment[requiredParam]) {
            return response
                .status(422)
                .send({ error: `Expected format: { author: <String>, main_text: <String> }. You're missing a "${requiredParam}" property.` });
        }
    }
    try {
        comment.shoe_id = shoeId;
        const commentData = await database('comments').insert(comment, ['id', 'created_at']);
        comment.id = commentData[0].id;
        comment.created_at = commentData[0].created_at;
        return response
            .status(200)
            .json(comment);
    } catch (error) {
        response.status(500).json({error});
    }
});

// post new shoe
app.post('/api/v1/shoes', async (request, response) => {
    const shoe = request.body;

    for(let requiredParam of ['brand', 'colorway', 'retail_price', 'model']) {
        if(!shoe[requiredParam]) {
            return response
                .status(422)
                .send({ error: `Expected format: { brand: <String>, colorway: <String>, retail_price: <String>, model: <String> }. You're missing a "${requiredParam}" property.` });  
        }
    }
    try {
     const shoeData = await database('shoes').insert(shoe, ['id', 'thumb_url', 'title', 'product', 'brand', 'colorway', 'demographic', 'retail_price', 'model', 'year', 'small_image_url', 'image_url'])
     const fromDatabase = shoeData[0] 
     shoe.id = fromDatabase.id
     shoe.thumb_url = fromDatabase.thumb_url
     shoe.title = fromDatabase.title
     shoe.product = fromDatabase.product
     shoe.demographic = fromDatabase.demographic
     shoe.year = fromDatabase.year
     shoe.image_url = fromDatabase.image_url
     shoe.small_image_url = fromDatabase.small_image_url
     shoe.thumb_url = fromDatabase.thumb_url
     return response 
        .status(200)
        .json(shoe)
    } catch (error) {
        response.status(500).json({error});
    }
})


module.exports = app