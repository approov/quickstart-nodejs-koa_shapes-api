// shapes api tests

const request = require('supertest');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { httpServer: server } = require('../server/index');

// close the service after all tests completed
afterAll(() => {
  server.close();
});

const V = '/v2';
describe(`get ${V}/`, () => {
  test('should return 404 (no root endpoint)', async () => {
    const response = await request(server).get(`${V}/`);
    expect(response.status).toEqual(404);
  });
});

describe(`get ${V}/hello`, () => {
  test('should respond with text greeting', async () => {
    const response = await request(server).get(`${V}/hello`);
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.text.trim()).toBeTruthy();
  });
});

const approovSecret = Buffer.from(fs.readFileSync(process.env.APPROOV_SECRET), 'base64');
const approovTokenHeader = 'approov-token';

const approovTagHeader = 'approov-tag';
const approovTag = 'APPROOV_TAG';
const payClaim = crypto.createHash('sha256').update(approovTag).digest('base64');

const shapes = [ 'Circle', 'Rectangle', 'Square', 'Triangle' ];

describe(`get ${V}/shapes`, () => {
  test('should respond with shape', async () => {
    const approovToken = jwt.sign({}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
    .get(`${V}/shapes`)
    .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(shapes).toContain(response.body.shape);
  });

  test('should respond with 400 (missing approov-token)', async () => {
    const response = await request(server)
    .get(`${V}/shapes`);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with 400 (invalid approov-token)', async () => {
    const approovToken = jwt.sign({}, approovSecret + '?', {expiresIn: '1h'});

    const response = await request(server)
    .get(`${V}/shapes`)
    .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with 400 (expired approov-token)', async () => {
    const approovToken = jwt.sign({}, approovSecret, {expiresIn: -3600});

    const response = await request(server)
    .get(`${V}/shapes`)
    .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with shape (matching claim)', async () => {
    const approovToken = jwt.sign({'pay': payClaim}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
      .get(`${V}/shapes`)
      .set(approovTagHeader, approovTag)
      .set(approovTokenHeader, approovToken);
        
      expect(response.status).toEqual(200);
      expect(response.type).toEqual('application/json');
      expect(shapes).toContain(response.body.shape);
    });

  test('should respond with shape (mismatching claim)', async () => {
    const approovToken = jwt.sign({'pay': payClaim + '?'}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
      .get(`${V}/shapes`)
      .set(approovTagHeader, approovTag)
      .set(approovTokenHeader, approovToken);
        
      expect(response.status).toEqual(200);
      expect(response.type).toEqual('application/json');
      expect(shapes).toContain(response.body.shape);
    });
});

const forms = [ 'Box', 'Cone', 'Cube', 'Sphere' ];

describe(`get ${V}/forms`, () => {
  test('should respond with form (matching claim)', async () => {
    const approovToken = jwt.sign({'pay': payClaim}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
      .get(`${V}/forms`)
      .set(approovTagHeader, approovTag)
      .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(forms).toContain(response.body.form);
  });

  test('should respond with form (no claim)', async () => {
    const approovToken = jwt.sign({}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
      .get(`${V}/forms`)
      .set(approovTagHeader, approovTag)
      .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(forms).toContain(response.body.form);
  });

  test('should respond with 400 (mismatching claim)', async () => {
    const approovToken = jwt.sign({'pay': payClaim + '?'}, approovSecret, {expiresIn: '1h'});

    const response = await request(server)
      .get(`${V}/forms`)
      .set(approovTagHeader, approovTag)
      .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with 400 (missing approov-token)', async () => {
    const response = await request(server)
    .get(`${V}/shapes`);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with 400 (invalid approov-token)', async () => {
    const approovToken = jwt.sign({}, approovSecret + '?', {expiresIn: '1h'});

    const response = await request(server)
    .get(`${V}/shapes`)
    .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(400);
  });

  test('should respond with 400 (expired approov-token)', async () => {
    const approovToken = jwt.sign({}, approovSecret, {expiresIn: -3600});

    const response = await request(server)
    .get(`${V}/shapes`)
    .set(approovTokenHeader, approovToken);
    
    expect(response.status).toEqual(400);
  });
});

// end of file
