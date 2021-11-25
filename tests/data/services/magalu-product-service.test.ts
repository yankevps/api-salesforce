import nock from 'nock'
import AppError from '../../../src/presentation/errors/app-error'
import MagaluProductService from '../../../src/data/services/magalu-product-service'
import apiMagalu from '../../../src/main/config/setup-api-magalu'

const mockMagaluShowResponse =
  {
    price: 1699,
    image: 'http://challenge-api.luizalabs.com/images/1bf0f365-fbdd-4e21-9786-da459d78dd1f.jpg',
    brand: 'bébé confort',
    id: '123-123-123-123',
    title: 'Cadeira para Auto Iseos Bébé Confort Earth Brown'
  }

describe('FavoriteService', () => {
  let magaluProductService: MagaluProductService

  beforeEach(() => {
    magaluProductService = new MagaluProductService()
  })

  it('should be return one product', async () => {
    jest.spyOn(apiMagalu, 'get').mockImplementationOnce(
      async (): Promise<any> => await Promise.resolve({ data: mockMagaluShowResponse })
    )

    const product = await magaluProductService.show('123-123-123-123')

    expect(product).toEqual(mockMagaluShowResponse)
  })

  it('should be return 404 with inexistent product id', async () => {
    nock('http://challenge-api.luizalabs.com')
      .get('/api/product/id_inexistente/')
      .reply(404)

    await expect(magaluProductService.show('id_inexistente'))
      .rejects.toEqual(new AppError('magalu product not found', 404))
  })

  it('should be return 500', async () => {
    nock('http://challenge-api.luizalabs.com')
      .get('/api/product/id_inexistente/')
      .reply(500)

    await expect(magaluProductService.show('id_inexistente'))
      .rejects.toEqual(new AppError('internal server error', 500))
  })
})
