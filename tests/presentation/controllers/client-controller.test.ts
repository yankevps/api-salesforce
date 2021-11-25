import request from 'supertest'
import { getConnection, getRepository, Repository } from 'typeorm'
import app from '../../../src/main/config/app'
import SetupDatabase from '../../../src/main/config/setup-database'
import config from '../../infra/mocks/database/mock-databaseconfig'
import UserService from '../../../src/data/services/user-service'
import UserRepository from '../../../src/infra/typeorm/user-repository'
import AuthService from '../../../src/data/services/auth-service'
import { IAuthService } from '../../../src/domain/services/auth-service'
import { Client } from '../../../src/domain/entities/client'
import { IClientService } from '../../../src/domain/services/client-service'

const makeClient = (email?: string): Client => {
  const client = new Client()
  client.email = email || 'client@email.com'
  client.name = 'client'

  return client
}

const makePostRequest = (name?: string, email?: string): IClientService.CreateParams => {
  return {
    name: name || 'um nome qualquer',
    email: email || 'umemailqualquer@email.com'
  }
}

const makePutRequest = (id?: number, name?: string, email?: string): IClientService.UpdateParams => {
  return {
    id: id || 1,
    name: name || 'um nome qualquer',
    email: email || 'umemailqualquer@email.com'
  }
}

const mockUser = {
  username: 'magalu', password: '123456'
}

describe('Client Controller', () => {
  let setupDatabase: SetupDatabase
  let clientRepository: Repository<Client>
  let userService: UserService
  let userRepsitory: UserRepository
  let authService: AuthService
  let authResponse: IAuthService.Result

  beforeEach(async () => {
    setupDatabase = new SetupDatabase(config)
    await setupDatabase.handle()

    userRepsitory = new UserRepository()
    userService = new UserService(userRepsitory)
    authService = new AuthService(userRepsitory)

    clientRepository = getRepository(Client)

    await clientRepository.save(
      [makeClient(),
        makeClient('client2@email.com')]
    )

    await userService.create(mockUser)
    authResponse = await authService.auth({ username: mockUser.username, password: mockUser.password })
  })

  afterEach(async () => {
    const conn = getConnection()
    return await conn.close()
  })

  describe('GET /api/clients', () => {
    test('Should return 200 on /api/clients', async () => {
      await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
    })
  })

  describe('GET /api/clients/:client_id', () => {
    test('Should return 200 on /api/clients/:client_id', async () => {
      await request(app)
        .get('/api/clients/2')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
    })
  })

  describe('GET /api/clients/:client_id', () => {
    test('Should return 404 on /api/clients/:client_id with inexistent id', async () => {
      await request(app)
        .get('/api/clients/3')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(404)
    })
  })

  describe('POST /api/clients', () => {
    test('Should return 200 on /api/clients with correct payload', async () => {
      await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(makePostRequest('Cliente POST', 'client_post@hotmail.com'))
        .expect(200)
        .then(response => {
          expect(response.body.name).toBe('Cliente POST')
          expect(response.body.email).toBe('client_post@hotmail.com')
        })
    })
  })

  describe('POST /api/clients', () => {
    test('Should return 400 on /api/clients with correct payload but already existing client', async () => {
      await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(makePostRequest('Cliente POST', 'client_post@hotmail.com'))
        .expect(200)

      await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(makePostRequest('Cliente POST', 'client_post@hotmail.com'))
        .expect(400)
    })
  })

  describe('PUT /api/clients/:client_id', () => {
    test('Should return 200 on /api/clients/:client_id with correct payload and client_id', async () => {
      const clientRequest = makePutRequest()

      await request(app)
        .put(`/api/clients/${clientRequest.id}`)
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(clientRequest)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(clientRequest)
        })
    })
  })

  describe('PUT /api/clients/:client_id', () => {
    test('Should return 404 on /api/clients/:client_id with inexistent client_id', async () => {
      const clientRequest = makePutRequest()

      await request(app)
        .put('/api/clients/100')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(clientRequest)
        .expect(404)
    })
  })

  describe('DELETE /api/clients/:client_id', () => {
    test('Should return 200 on /api/clients/:client_id', async () => {
      await request(app)
        .delete('/api/clients/1')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
    })
  })

  describe('DELETE /api/clients/:client_id', () => {
    test('Should return 404 on /api/clients/:client_id with inexistent client_id', async () => {
      await request(app)
        .delete('/api/clients/100')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(404)
    })
  })
})
