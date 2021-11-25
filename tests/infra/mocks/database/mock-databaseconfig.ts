import { ConnectionOptions } from 'typeorm'

const config: ConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [
    'src/domain/entities/**/*{.ts,.js}'
  ],
  synchronize: true,
  logging: false
}

export = config
