// import "@babel/polyfill";

const request = require('supertest');
const app = require('../server/server.js');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// beforeEach(function(){
//   let server = app.listen(3000);
// });
// // tests here
// afterEach(function(){
//   server.close();
// })
describe('Server', () => {
  
  describe('init', () => {
    it('should return a 200 status', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/shoez', () => {
    it('should return a 404 if wrong endpoint', async () => {
      // setup
      const res = await request(app).get('/api/v1/shoez');
      expect(res.status).toBe(404);
    });
  });
  
  describe('GET /api/v1/shoes', () => {
    it('should return a 200 and all of the shoes', async () => {
      // setup
      const expectedShoes = JSON.stringify(await database('shoes').select());
      // execution
      const res = await request(app).get('/api/v1/shoes');
      const shoes = res.text;
      //expectation
      expect(res.status).toBe(200);
      expect(shoes).toEqual(expectedShoes);
    });
  });
  describe('GET /api/v1/shoes/:id', () => {
    it('should return a 200 and a single shoe', async () => {
      const expectedShoe = JSON.stringify(await database('shoes').first());
      const {id} = expectedShoe;
      const res = await request(app).get(`/api/v1/shoes/1`);
      const shoe = res.text;
      expect(shoe).toEqual(expectedShoe);
    });
  });
  describe('POST /api/v1/shoes', () => {
    it('should post a new shoe to the db', async () => {
      const newShoe = JSON.stringify({brand: "Nike", colorway: "Blue", retail_price: 200, model: "test" })
      const res = await request(app).post('/api/v1/shoes').send(newShoe)
      const shoes = await database('shoes').where('brand', "Nike");
      const shoe = shoes;
      expect(shoe.brand).toEqual(newShoe.brand)
    });
  });
});