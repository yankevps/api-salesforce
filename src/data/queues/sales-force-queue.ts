import RabbitmqServer from '../../main/config/setup-rabbitmq'

export default (server: RabbitmqServer): void => {
  const updateProduct = async (message): Promise<void> => {
    try {
      console.info('passou aqui')
      console.log(message.content.toString())
    } catch (error) {
      console.log(error)
    }
  }

  server.start().then(async () => {
    await server.consume('product-external', updateProduct)
  }).catch(err => {
    console.log(err)
  })
}
