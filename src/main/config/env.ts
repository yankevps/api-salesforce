import './bootstrap'

export default {
  port: process.env.PORT || 3333,
  jwt_secret: process.env.JWT_SECRET || 'default_test',
  jwt_expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  amqp_rabbitmq: process.env.AMQP_RABBITMQ || '1d'
}
