import { Favorite } from '../../../../../src/domain/entities/favorite'
import { IFavoriteRepository } from '../../../../../src/infra/repositories/favorite-repository'

class FakeFavoriteRepository implements IFavoriteRepository {
  private favorites: Favorite[] = []

  public async index (): Promise<IFavoriteRepository.IndexResult[]> {
    return this.favorites
  }

  public async show (favoriteId: string): Promise<IFavoriteRepository.ShowResult | undefined> {
    return this.favorites.find(favorite => favorite.id.toString() === favoriteId)
  }

  public async create (favoriteData: IFavoriteRepository.CreateParams): Promise<IFavoriteRepository.CreateResult> {
    const favorite = new Favorite()
    Object.assign(favorite, { id: 1, ...favoriteData })
    this.favorites.push(favorite)
    return favorite
  }

  public async verifyAlreadyExists (clientId: number, productId: number): Promise<boolean> {
    const findFavorite = this.favorites.find(favorite =>
      favorite.clientId === clientId &&
      favorite.productId === productId
    )
    return !!findFavorite
  }

  public async delete (favoriteId: number): Promise<string> {
    this.favorites = this.favorites.filter(favorite => favorite.id !== favoriteId)
    return 'Favorite successfully deleted'
  }
}

export default FakeFavoriteRepository
