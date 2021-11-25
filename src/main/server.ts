import 'reflect-metadata'
import env from './config/env'
import RabbitmqServer from './config/setup-rabbitmq'
import setupProductExternalQueue from '../data/queues/sales-force-queue'
import app from './config/app'

const rabbitMqServer = new RabbitmqServer(env.amqp_rabbitmq)

setupProductExternalQueue(rabbitMqServer)

app.listen(env.port, () => console.log(`Server running at http://localhost:${env.port}/api`))
