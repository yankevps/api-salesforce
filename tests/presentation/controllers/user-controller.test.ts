import request from 'supertest'
import { getConnection } from 'typeorm'
import { IUserRepository } from '../../../src/infra/repositories/user-repository'
import app from '../../../src/main/config/app'
import SetupDatabase from '../../../src/main/config/setup-database'
import config from '../../infra/mocks/database/mock-databaseconfig'

const makePostRequest = (username?: string, password?: string): IUserRepository.CreateParams => {
  return {
    username: username || 'magalu',
    password: password || '123456'
  }
}

describe('User Controller', () => {
  let setupDatabase: SetupDatabase

  beforeEach(async () => {
    setupDatabase = new SetupDatabase(config)
    await setupDatabase.handle()
  })

  afterEach(async () => {
    const conn = getConnection()
    return await conn.close()
  })

  describe('POST /api/users', () => {
    test('should be able to insert user with correct payload', async () => {
      const payload = makePostRequest()

      await request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual({ username: payload.username, id: response.body.id })
        })
    })
  })

  describe('POST /api/users', () => {
    test('should not be able to insert user with already existing username', async () => {
      await request(app)
        .post('/api/users')
        .send(makePostRequest('magalu', '123456'))
        .expect(200)

      await request(app)
        .post('/api/users')
        .send(makePostRequest('magalu', '654321'))
        .expect(400)
    })
  })
})
