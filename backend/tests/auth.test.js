jest.mock('../models/User', () => ({
  create: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('../utils/generateJWT', () => ({
  signJWT: jest.fn(() => 'signed-token')
}));

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signup returns a token and hashed password', async () => {
    bcrypt.hash.mockResolvedValue('hashed-password');
    User.create.mockResolvedValue({ _id: 'user-1', name: 'A', email: 'a@example.com' });

    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'A', email: 'a@example.com', password: 'secret' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('signed-token');
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(User.create).toHaveBeenCalledWith({ name: 'A', email: 'a@example.com', password: 'hashed-password' });
  });

  test('login returns a token for valid credentials', async () => {
    User.findOne.mockResolvedValue({ _id: 'user-2', email: 'a@example.com', password: 'hashed-password' });
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@example.com', password: 'secret' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('signed-token');
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed-password');
  });
});
