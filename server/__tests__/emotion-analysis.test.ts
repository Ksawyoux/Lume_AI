
import request from 'supertest';
import { app } from '../index';

describe('Emotion Analysis API', () => {
  it('should analyze text emotions', async () => {
    const response = await request(app)
      .post('/api/emotion-analysis')
      .send({ text: 'I am feeling happy today!' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('emotion');
  });
});
