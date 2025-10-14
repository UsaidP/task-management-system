import app from '../../app.js';
import supertest from 'supertest';
import { beforeAll, afterAll, jest } from '@jest/globals';
import { User } from '../models/user.model.js';

let server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('Auth Controller', () => {
  it('should return 201 for successful registration', async () => {
    const findOneSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const createSpy = jest.spyOn(User, 'create').mockResolvedValue({
      _id: 'some-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullname: 'Test User',
      generateTemporaryToken: jest.fn().mockResolvedValue({
        unHashedToken: 'some-token',
        hashToken: 'some-hash-token',
        tokenExpiry: Date.now() + 3600000,
      }),
      save: jest.fn().mockResolvedValue(true),
    });
    const findByIdSpy = jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'some-id',
        username: 'testuser',
        email: 'test@example.com',
        fullname: 'Test User',
      }),
    });

    const response = await supertest(server)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullname: 'Test User',
      });
    expect(response.statusCode).toBe(201);

    findOneSpy.mockRestore();
    createSpy.mockRestore();
    findByIdSpy.mockRestore();
  });
});
