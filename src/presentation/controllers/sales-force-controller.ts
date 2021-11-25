import { Request, Response } from 'express'
import env from '../../main/config/env'
import RabbitmqServer from '../../main/config/setup-rabbitmq'

export default class SalesForceController {
  public async post (request: Request, response: Response): Promise<Response> {
    const rabbitMqServer = new RabbitmqServer(env.amqp_rabbitmq)
    await rabbitMqServer.start()
    console.info(request.body)
    await rabbitMqServer.publishInQueue('product-external', JSON.stringify(request.body))
    await rabbitMqServer.close()
    return response.json()
  }
}
