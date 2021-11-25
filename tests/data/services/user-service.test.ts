import AppError from '../../../src/presentation/errors/app-error'
import UserService from '../../../src/data/services/user-service'
import { IUserRepository } from '../../../src/infra/repositories/user-repository'
import FakeUserRepository from '../../infra/mocks/typeorm/repositories/fake-user-repository'

const makeUserCreateRequest = (username?: string, password?: string): IUserRepository.CreateParams => {
  return {
    username: username || 'magalu',
    password: password || '123456'
  }
}

describe('UserService', () => {
  let userService: UserService
  let fakeUserRepository: FakeUserRepository

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository()
    userService = new UserService(fakeUserRepository)
  })

  it('should be insert one user', async () => {
    const request = makeUserCreateRequest()

    const user = await userService.create(request)

    expect(user).toEqual({ username: request.username, id: user.id })
  })

  it('should be not insert one user with e-mail already created', async () => {
    const request = makeUserCreateRequest()
    await userService.create(request)

    await expect(
      userService.create(request)
    ).rejects.toEqual(new AppError('username already used.'))
  })
})
