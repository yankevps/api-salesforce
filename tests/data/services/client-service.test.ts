import AppError from '../../../src/presentation/errors/app-error'
import { Client } from '../../../src/domain/entities/client'
import ClientService from '../../../src/data/services/client-service'
import FakeClientRepository from '../../infra/mocks/typeorm/repositories/fake-client-repository'

const makeClient = (nome?: string, email?: string): Client => {
  const client = new Client()
  client.email = email || 'client@email.com'
  client.name = nome || 'client'

  return client
}

describe('ClientService', () => {
  let fakeClientRepository: FakeClientRepository
  let clientService: ClientService

  beforeEach(() => {
    fakeClientRepository = new FakeClientRepository()
    clientService = new ClientService(fakeClientRepository)
  })

  it('should be list of clients', async () => {
    await clientService.create(makeClient())

    const listOfClients = await clientService.index()

    expect(listOfClients).toHaveLength(1)
  })

  it('should be return one client', async () => {
    await clientService.create(makeClient())

    const client = await clientService.show('1')

    expect(client).toHaveProperty('id')
    expect(client.id).toBe(1)
  })

  it('should be insert one client', async () => {
    const mockClient = makeClient()
    const client = await clientService.create(mockClient)

    expect(client).toHaveProperty('id')
    expect(client.name).toBe(mockClient.name)
    expect(client.email).toBe(mockClient.email)
  })

  it('should be return 400 when try insert already exist client', async () => {
    await clientService.create(makeClient())

    await expect(clientService.create(makeClient()))
      .rejects.toEqual(new AppError('Client already exists'))
  })

  it('should be update one client', async () => {
    const clientCreated = await clientService.create(makeClient())

    const mockClient = makeClient('nome_atualizado', 'atualizado@email.com')
    const client = await clientService.update({ ...mockClient, id: clientCreated.id })

    expect(client).toEqual({ ...mockClient, id: clientCreated.id })
  })

  it('should be return 404 when try update a client inexistent', async () => {
    const mockClient = makeClient()

    await expect(clientService.update({ ...mockClient, id: 100 }))
      .rejects.toEqual(new AppError('Client not exists', 404))
  })

  it('should be delete one client', async () => {
    const clientCreated = await clientService.create(makeClient())
    const result = await clientService.delete(clientCreated.id)
    expect(result).toEqual('Client successfully deleted')
  })

  it('should be return 400 when try delete a client inexistent', async () => {
    await expect(clientService.delete(100))
      .rejects.toEqual(new AppError('Client not exists', 404))
  })
})
