import dotenv from 'dotenv'

let path = '.env'

if (process.env.NODE_ENV === 'production') {
  path = '.env.production'
} else if (process.env.NODE_ENV === 'staging') {
  path = '.env.staging'
} else if (process.env.NODE_ENV === 'test') {
  path = '.env.test'
}

dotenv.config({ path })
