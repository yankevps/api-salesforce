import { Product } from '../../../../../src/domain/entities/product'
import { IProductRepository } from '../../../../../src/infra/repositories/product-repository'

class FakeProductRepository implements IProductRepository {
  private readonly products: Product[] = []

  public async create (productData: IProductRepository.CreateParams): Promise<IProductRepository.CreateResult> {
    const product = new Product()
    Object.assign(product, { id: 1, ...productData })
    this.products.push(product)
    return product
  }

  public async update (productData: IProductRepository.UpdateParams): Promise<IProductRepository.UpdateResult> {
    const findProduct = this.products.find(product => product.integrationId === productData.integrationId)
    if (findProduct) {
      Object.assign(findProduct, { ...productData })
      this.products.push(findProduct)
      return findProduct
    }
    this.products.push({ favorites: [], ...productData })
    return productData
  }

  public async findByIntegrationId (integrationId: string): Promise<IProductRepository.FindByIntegrationIdResult | undefined> {
    const findProduct = this.products.find(product => product.integrationId === integrationId)
    return findProduct
  }
}

export default FakeProductRepository
