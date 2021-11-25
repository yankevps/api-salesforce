import request from 'supertest'
import app from '../../../src/main/config/app'

describe('Root Routes', () => {
  describe('GET /api', () => {
    test('Should return 200 on /api', async () => {
      await request(app)
        .get('/api')
        .expect(200)
    })
  })
})
