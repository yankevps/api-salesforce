import { User } from '../../../../../src/domain/entities/user'
import { IUserRepository } from '../../../../../src/infra/repositories/user-repository'

class FakeUserRepository implements IUserRepository {
  private readonly users: User[] = []

  public async findByUsername (username: string): Promise<IUserRepository.FindByUsernameResult | undefined> {
    return this.users.find(user => user.username.toString() === username)
  }

  public async create (userData: IUserRepository.CreateParams): Promise<IUserRepository.CreateResult> {
    const user = new User()
    Object.assign(user, { id: 1, ...userData })
    this.users.push(user)
    return user
  }
}

export default FakeUserRepository
