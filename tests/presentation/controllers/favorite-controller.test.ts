import request from 'supertest'
import { getConnection, getRepository, Repository } from 'typeorm'
import nock from 'nock'
import app from '../../../src/main/config/app'
import SetupDatabase from '../../../src/main/config/setup-database'
import config from '../../infra/mocks/database/mock-databaseconfig'
import UserService from '../../../src/data/services/user-service'
import UserRepository from '../../../src/infra/typeorm/user-repository'
import AuthService from '../../../src/data/services/auth-service'
import { Product } from '../../../src/domain/entities/product'
import ProductService from '../../../src/data/services/product-service'
import { IAuthService } from '../../../src/domain/services/auth-service'
import { IProductService } from '../../../src/domain/services/product-service'
import { makeProductService } from '../../../src/main/factories/services/product-service-factory'
import { makeClientService } from '../../../src/main/factories/services/client-service-factory'
import { Client } from '../../../src/domain/entities/client'
import ClientService from '../../../src/data/services/client-service'
import { Favorite } from '../../../src/domain/entities/favorite'
import { IFavoriteService } from '../../../src/domain/services/favorite-service'

const makeFavorite = (clientId?: number, productId?: number): Favorite => {
  const favorite = new Favorite()
  favorite.clientId = clientId || 1
  favorite.productId = productId || 1

  return favorite
}

const makeClient = (email?: string): Client => {
  const client = new Client()
  client.email = email || 'client@email.com'
  client.name = 'client'

  return client
}

const makeProduct = (productRequest?: IProductService.CreateParams): Product => {
  const product = new Product()
  product.integrationId = productRequest?.integrationId || '123-123-123'
  product.title = productRequest?.title || 'Boneca Molenga'
  product.price = productRequest?.price || 100.00
  product.image = productRequest?.image || 'http://challenge-api.luizalabs.com/images/1bf0f365-fbdd-4e21-9786-da459d78dd1f.jpg'

  return product
}

const makePostRequest = (clientId?: number, externalProductId?: string): IFavoriteService.CreateParams => {
  return {
    clientId: clientId || 1,
    externalProductId: externalProductId || '123-123-123'
  }
}

const mockMagaluShowResponse = {
  price: 1699,
  image: 'http://challenge-api.luizalabs.com/images/1bf0f365-fbdd-4e21-9786-da459d78dd1f.jpg',
  brand: 'bébé confort',
  id: '123-123-123-123',
  title: 'Cadeira para Auto Iseos Bébé Confort Earth Brown'
}

const mockUser = {
  username: 'magalu', password: '123456'
}

describe('Favorite Controller', () => {
  let setupDatabase: SetupDatabase
  let favoriteRepository: Repository<Favorite>
  let clientService: ClientService
  let productService: ProductService
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

    favoriteRepository = getRepository(Favorite)
    clientService = makeClientService()
    productService = makeProductService()

    await userService.create(mockUser)
    authResponse = await authService.auth({ username: mockUser.username, password: mockUser.password })
  })

  afterEach(async () => {
    const conn = getConnection()
    return await conn.close()
  })

  describe('GET /api/favorites', () => {
    test('Should return 200 on /api/favorites?client_id=1', async () => {
      const client = await clientService.create(makeClient())
      const product = await productService.create(makeProduct())
      await favoriteRepository.save(makeFavorite(client.id, product.id))

      await request(app)
        .get(`/api/favorites?client_id=${client.id}`)
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveLength(1)
        })
    })

    test('Should return 400 on /api/favorites with not inform client_id query param', async () => {
      await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(400)
    })

    test('Should return 200 on /api/favorites/:favorite_id', async () => {
      const client = await clientService.create(makeClient())
      const product = await productService.create(makeProduct())
      const favorite = await favoriteRepository.save(makeFavorite(client.id, product.id))

      await request(app)
        .get(`/api/favorites/${favorite.id}`)
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
    })
  })

  describe('GET /api/favorites/:favorite_id', () => {
    test('Should return 404 on /api/favorites/:favorite_id with inexistent id', async () => {
      await request(app)
        .get('/api/favorites/3')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(404)
    })
  })

  describe('POST /api/favorites', () => {
    test('Should return 200 on /api/favorites with correct payload', async () => {
      const client = await clientService.create(makeClient())

      const product = await productService.create(makeProduct({
        integrationId: mockMagaluShowResponse.id,
        title: mockMagaluShowResponse.title,
        price: mockMagaluShowResponse.price,
        image: mockMagaluShowResponse.image
      }))

      nock('http://challenge-api.luizalabs.com')
        .get(`/api/product/${mockMagaluShowResponse.id}/`)
        .reply(200, mockMagaluShowResponse)

      const mockRequest = makePostRequest(client.id, mockMagaluShowResponse.id)

      await request(app)
        .post('/api/favorites')
        .send(mockRequest)
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual({ id: response.body.id, clientId: mockRequest.clientId, productId: product.id })
        })
    })

    test('Should return 400 on /api/favorites with already existing favorite', async () => {
      const client = await clientService.create(makeClient())

      const product = await productService.create(makeProduct({
        integrationId: mockMagaluShowResponse.id,
        title: mockMagaluShowResponse.title,
        price: mockMagaluShowResponse.price,
        image: mockMagaluShowResponse.image
      }))

      nock('http://challenge-api.luizalabs.com')
        .get(`/api/product/${mockMagaluShowResponse.id}/`)
        .reply(200, mockMagaluShowResponse)

      const mockRequest = makePostRequest(client.id, mockMagaluShowResponse.id)

      await favoriteRepository.save(makeFavorite(client.id, product.id))

      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(mockRequest)
        .expect(400)
    })

    test('Should return 404 on /api/favorites with inexistent client', async () => {
      const mockRequest = makePostRequest(1, mockMagaluShowResponse.id)

      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(mockRequest)
        .expect(404)
    })

    test('Should return 404 on /api/favorites with inexistent product', async () => {
      const client = await clientService.create(makeClient())
      const mockRequest = makePostRequest(client.id, mockMagaluShowResponse.id)

      nock('http://challenge-api.luizalabs.com')
        .get(`/api/product/${mockMagaluShowResponse.id}/`)
        .reply(404)

      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .send(mockRequest)
        .expect(404)
    })
  })

  describe('DELETE /api/favorites/:favorite_id', () => {
    test('Should return 200 on /api/favorites/:favorite_id', async () => {
      const client = await clientService.create(makeClient())
      const product = await productService.create(makeProduct())
      const favorite = await favoriteRepository.save(makeFavorite(client.id, product.id))

      await request(app)
        .delete(`/api/favorites/${favorite.id}`)
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(200)
    })

    test('Should return 404 on /api/favorites/:favorite_id with inexistent favorite_id', async () => {
      await request(app)
        .delete('/api/favorites/100')
        .set('Authorization', `Bearer ${authResponse.accessToken}`)
        .expect(404)
    })
  })
})
