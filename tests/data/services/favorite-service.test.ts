import FakeFavoriteRepository from '../../infra/mocks/typeorm/repositories/fake-favorite-repository'
import AppError from '../../../src/presentation/errors/app-error'
import FakeClientRepository from '../../infra/mocks/typeorm/repositories/fake-client-repository'
import FakeProductRepository from '../../infra/mocks/typeorm/repositories/fake-product-repository'
import { Client } from '../../../src/domain/entities/client'
import ClientService from '../../../src/data/services/client-service'
import MagaluProductService from '../../../src/data/services/magalu-product-service'
import { IFavoriteService } from '../../../src/domain/services/favorite-service'
import FavoriteService from '../../../src/data/services/favorite-service'

const makeFavorite = (clientId?: number, externalProductId?: string): IFavoriteService.CreateParams => {
  return {
    clientId: clientId || 1,
    externalProductId: externalProductId || '123-123-123-123-123'
  }
}

const makeClient = (nome?: string, email?: string): Client => {
  const client = new Client()
  client.email = email || 'client@email.com'
  client.name = nome || 'client'

  return client
}

const mockMagaluShowResponse =
  {
    price: 1699,
    image: 'http://challenge-api.luizalabs.com/images/1bf0f365-fbdd-4e21-9786-da459d78dd1f.jpg',
    brand: 'bébé confort',
    id: '123-123-123-123-123',
    title: 'Cadeira para Auto Iseos Bébé Confort Earth Brown'
  }

describe('FavoriteService', () => {
  let fakeFavoriteRepository: FakeFavoriteRepository
  let fakeProductRepository: FakeProductRepository
  let favoriteService: FavoriteService
  let clientService: ClientService
  let fakeClientRepository: FakeClientRepository
  let magaluProductService: MagaluProductService

  beforeEach(() => {
    fakeFavoriteRepository = new FakeFavoriteRepository()
    fakeClientRepository = new FakeClientRepository()
    fakeProductRepository = new FakeProductRepository()
    magaluProductService = new MagaluProductService()
    favoriteService = new FavoriteService(fakeFavoriteRepository, fakeClientRepository, fakeProductRepository, magaluProductService)
    clientService = new ClientService(fakeClientRepository)
  })

  it('should be list of favorites by client', async () => {
    const client = await clientService.create(makeClient())

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    await favoriteService.create(makeFavorite(client.id))

    const listOfFavorites = await favoriteService.index(client.id)

    expect(listOfFavorites).toHaveLength(1)
  })

  it('should be return one favorite', async () => {
    const client = await clientService.create(makeClient())

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    const favorite = await favoriteService.create(makeFavorite(client.id))

    const result = await favoriteService.show(favorite.id.toString())

    expect(result).toHaveProperty('id')
    expect(result.id).toBe(favorite.id)
  })

  it('should be return 404 when try get inexistent favorite', async () => {
    await expect(favoriteService.show('100'))
      .rejects.toEqual(new AppError('favorite not found', 404))
  })

  it('should be insert one favorite with inexistent product in database', async () => {
    const client = await clientService.create(makeClient())
    const mockFavorite = makeFavorite(client.id)

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    const favorite = await favoriteService.create(mockFavorite)

    expect(favorite).toEqual({ id: favorite.id, productId: 1, clientId: client.id })
  })

  it('should be insert one favorite with existent product in database', async () => {
    const client = await clientService.create(makeClient())
    const mockFavorite = makeFavorite(client.id, mockMagaluShowResponse.id)

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    await fakeProductRepository.create({
      integrationId: mockMagaluShowResponse.id,
      title: mockMagaluShowResponse.title,
      price: mockMagaluShowResponse.price,
      image: mockMagaluShowResponse.image
    })

    const favorite = await favoriteService.create(mockFavorite)

    expect(favorite).toEqual({ id: favorite.id, productId: 1, clientId: client.id })
  })

  it('should be return 400 when try insert favorite with same product', async () => {
    const productId = mockMagaluShowResponse.id
    const client = await clientService.create(makeClient())

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    await favoriteService.create(makeFavorite(client.id, productId))

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    await expect(favoriteService.create(makeFavorite(client.id, productId)))
      .rejects.toEqual(new AppError('favorite already exists'))
  })

  it('should be return 404 when try insert favorite with inexistent client', async () => {
    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    await expect(favoriteService.create(makeFavorite(100)))
      .rejects.toEqual(new AppError('client not found', 404))
  })

  it('should be return 404 when try insert favorite with inexistent magalu product', async () => {
    const client = await clientService.create(makeClient())

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.reject(
        new AppError('magalu product not found', 404)
      )
    )

    await expect(favoriteService.create(makeFavorite(client.id, 'id_invalido')))
      .rejects.toEqual(new AppError('magalu product not found', 404))
  })

  it('should be delete one favorite', async () => {
    const client = await clientService.create(makeClient())

    jest.spyOn(magaluProductService, 'show').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve(mockMagaluShowResponse)
    )

    const favorite = await favoriteService.create(makeFavorite(client.id))

    const result = await favoriteService.delete(favorite.id)
    expect(result).toEqual('favorite successfully deleted')
  })

  it('should be return 400 when try delete a favorite inexistent', async () => {
    await expect(favoriteService.delete(100))
      .rejects.toEqual(new AppError('favorite not exists', 404))
  })
})
