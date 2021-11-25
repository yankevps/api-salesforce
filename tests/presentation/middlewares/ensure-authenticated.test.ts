import request from 'supertest'
import jwt from 'jsonwebtoken'
import { ensureAuthenticated } from '../../../src/presentation/middlewares/ensure-authenticated'
import app from '../../../src/main/config/app'

const mockRoute = (): void => {
  app.get('/test_ensure_authenticated', ensureAuthenticated, (req, res) => {
    res.send('')
  })
}

describe('Ensure Authenticated Middleware', () => {
  test('Should return 401 when JWT token is missing', async () => {
    mockRoute()
    await request(app)
      .get('/test_ensure_authenticated')
      .expect(401)
  })

  test('Should return 401 when JWT token is missing', async () => {
    mockRoute()
    await request(app)
      .get('/test_ensure_authenticated')
      .set('Authorization', 'Bearer 123123123')
      .expect(401)
  })

  test('Should return 200 when JWT token is valid', async () => {
    const verify = jest.spyOn(jwt, 'verify')
    verify.mockImplementation(() => () => ({ verified: 'true' }))

    mockRoute()
    await request(app)
      .get('/test_ensure_authenticated')
      .set('Authorization', 'Bearer 123123123')
      .expect(200)
  })
})
