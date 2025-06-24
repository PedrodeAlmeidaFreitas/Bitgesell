const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Helper to reset data file for tests
const testData = [
  { id: 1, name: 'Apple', price: 1.5 },
  { id: 2, name: 'Banana', price: 2.0 },
  { id: 3, name: 'Carrot', price: 0.5 }
];

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('Items API', () => {
  beforeEach(async () => {
    await fs.writeFile(DATA_PATH, JSON.stringify(testData));
  });

  test('GET /api/items returns all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
  });

  test('GET /api/items?q=ban returns filtered items', async () => {
    const res = await request(app).get('/api/items?q=ban');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Banana');
  });

  test('GET /api/items?limit=2 returns limited items', async () => {
    const res = await request(app).get('/api/items?limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('GET /api/items/:id returns item by id', async () => {
    const res = await request(app).get('/api/items/2');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Banana');
  });

  test('GET /api/items/:id returns 404 for missing item', async () => {
    const res = await request(app).get('/api/items/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({});
  });
});
