import request from 'supertest'
import { getConnection, getRepository } from 'typeorm'
import UserRepository from '../../../src/infra/typeorm/user-repository'
import { User } from '../../../src/domain/entities/user'
import { IUserRepository } from '../../../src/infra/repositories/user-repository'
import UserService from '../../../src/data/services/user-service'
import app from '../../../src/main/config/app'
import SetupDatabase from '../../../src/main/config/setup-database'
import config from '../../infra/mocks/database/mock-databaseconfig'
import { IUserService } from '../../../src/domain/services/user-service'

const makePostRequest = (username?: string, password?: string): IUserRepository.CreateParams => {
  return {
    username: username || 'magalu',
    password: password || '123456'
  }
}

const makeUser = (username?: string, password?: string): IUserService.CreateParams => {
  const user = new User()
  user.username = username || 'magalu'
  user.password = password || '123456'
  return user
}

describe('User Controller', () => {
  let setupDatabase: SetupDatabase
  let userService: UserService
  let userRepository: UserRepository

  beforeEach(async () => {
    setupDatabase = new SetupDatabase(config)
    await setupDatabase.handle()
    getRepository(User)

    userRepository = new UserRepository()
    userService = new UserService(userRepository)
  })

  afterEach(async () => {
    const conn = getConnection()
    return await conn.close()
  })

  describe('POST /api/auth', () => {
    test('should be able to auth user with correct payload', async () => {
      await userService.create(makeUser())

      const payload = makePostRequest()

      await request(app)
        .post('/api/auth')
        .send(payload)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('accessToken')
          expect(response.body.user).toBe(payload.username)
        })
    })
  })

  describe('POST /api/auth', () => {
    test('should not be able to auth user with incorrect password', async () => {
      await userService.create(makeUser('magalu', '123456'))

      await request(app)
        .post('/api/auth')
        .send(makePostRequest('magalu', '654321'))
        .expect(401)
    })
  })

  describe('POST /api/auth', () => {
    test('should not be able to auth inexistent user', async () => {
      await request(app)
        .post('/api/auth')
        .send(makePostRequest('magalu', '654321'))
        .expect(401)
    })
  })
})
