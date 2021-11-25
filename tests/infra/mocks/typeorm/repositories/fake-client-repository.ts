import { Client } from '../../../../../src/domain/entities/client'
import { IClientRepository } from '../../../../../src/infra/repositories/client-repository'

class FakeClientRepository implements IClientRepository {
  private clients: Client[] = []

  public async index (): Promise<IClientRepository.IndexResult[]> {
    return this.clients
  }

  public async show (clientId: string): Promise<IClientRepository.ShowResult | undefined> {
    return this.clients.find(client => client.id.toString() === clientId)
  }

  public async create (clientData: IClientRepository.CreateParams): Promise<IClientRepository.CreateResult> {
    const client = new Client()
    Object.assign(client, { id: 1, ...clientData })
    this.clients.push(client)
    return client
  }

  public async findByEmail (clientEmail: string): Promise<IClientRepository.FindByEmailResult | undefined> {
    const findClient = this.clients.find(client => client.email === clientEmail)
    return findClient
  }

  public async update (clientData: IClientRepository.UpdateParams): Promise<IClientRepository.UpdateResult> {
    const findClient = this.clients.find(client => client.id === clientData.id)
    if (findClient) {
      Object.assign(findClient, { ...clientData })
      this.clients.push(findClient)
      return findClient
    }
    this.clients.push({ favorites: [], ...clientData })
    return clientData
  }

  public async delete (clientId: number): Promise<string> {
    this.clients = this.clients.filter(client => client.id !== clientId)
    return 'Client successfully deleted'
  }
}

export default FakeClientRepository
