import { Message } from 'amqplib'
import { ChannelWrapper, connect } from 'amqp-connection-manager'
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager'
export default class RabbitmqServer {
  private conn: IAmqpConnectionManager
  private channel: ChannelWrapper

  constructor (private readonly uri: string) {}

  async start (): Promise<void> {
    this.conn = await connect(this.uri)
    this.channel = await this.conn.createChannel()
  }

  async close (): Promise<void> {
    this.conn && await this.conn.close()
  }

  async publishInQueue (queue: string, message: string): Promise<boolean> {
    return await this.channel.sendToQueue(queue, Buffer.from(message))
  }

  async publishInExchange (
    exchange: string,
    routingKey: string,
    message: string
  ): Promise<boolean> {
    return await this.channel.publish(exchange, routingKey, Buffer.from(message))
  }

  async consume (queue: string, callback: (message: Message) => void): Promise<void> {
    return await this.channel.consume(queue, (message: Message | null) => {
      message && callback(message)
      message && this.channel.ack(message)
    })
  }
}
