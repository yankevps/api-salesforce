import AppError from '../../../src/presentation/errors/app-error'
import AuthService from '../../../src/data/services/auth-service'
import UserService from '../../../src/data/services/user-service'
import { IUserRepository } from '../../../src/infra/repositories/user-repository'
import FakeUserRepository from '../../infra/mocks/typeorm/repositories/fake-user-repository'

const makeUserCreateRequest = (username?: string, password?: string): IUserRepository.CreateParams => {
  return {
    username: username || 'magalu',
    password: password || '123456'
  }
}

describe('AuthService', () => {
  let authService: AuthService
  let userService: UserService
  let fakeUserRepository: FakeUserRepository

  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository()
    userService = new UserService(fakeUserRepository)
    authService = new AuthService(fakeUserRepository)
  })

  it('should be able to authenticate with correct credentials', async () => {
    const request = makeUserCreateRequest()
    await userService.create(request)

    const result = await authService.auth({ username: request.username, password: request.password })

    expect(result).toHaveProperty('accessToken')
    expect(result.user).toBe(request.username)
  })

  it('should not be able to authenticate with incorrect credentials', async () => {
    const request = makeUserCreateRequest('magalu', '123456')
    await userService.create(request)

    await expect(authService.auth(
      { username: request.username, password: '654321' }
    ))
      .rejects.toEqual(new AppError('incorrect email/password combination', 401))
  })

  it('should not be able to authenticate with non existing user', async () => {
    await expect(authService.auth({ username: 'magalu', password: '123456' }))
      .rejects.toEqual(new AppError('incorrect email/password combination', 401))
  })
})
