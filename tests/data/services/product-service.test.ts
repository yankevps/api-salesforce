import AppError from '../../../src/presentation/errors/app-error'
import ProductService from '../../../src/data/services/product-service'
import { IProductService } from '../../../src/domain/services/product-service'
import FakeProductRepository from '../../infra/mocks/typeorm/repositories/fake-product-repository'

const makeProductCreateRequest = (ingreationId?: string, title?: string, price?: number, image?: string): IProductService.CreateParams => {
  return {
    integrationId: ingreationId || '123-123-123-123',
    title: title || 'title',
    price: price || 100.00,
    image: image || 'http://image.com.br'
  }
}

describe('ProductService', () => {
  let productService: ProductService
  let fakeProductRepository: FakeProductRepository

  beforeEach(() => {
    fakeProductRepository = new FakeProductRepository()
    productService = new ProductService(fakeProductRepository)
  })

  it('should be insert one product', async () => {
    const request = makeProductCreateRequest()

    const product = await productService.create(request)

    expect(product).toEqual({ ...request, id: product.id })
  })

  it('should be not insert one product with already created', async () => {
    const request = makeProductCreateRequest()
    await productService.create(request)

    await expect(
      productService.create(request)
    ).rejects.toEqual(new AppError('product already exists'))
  })

  it('should be update one product', async () => {
    const request = makeProductCreateRequest()
    const productCreated = await productService.create(request)

    const product = await productService.update(request)

    expect(product).toEqual({ ...request, id: productCreated.id })
  })

  it('should be return 404 when try update a product inexistent', async () => {
    const request = makeProductCreateRequest()

    await expect(productService.update(request))
      .rejects.toEqual(new AppError('product not exists', 404))
  })
})
