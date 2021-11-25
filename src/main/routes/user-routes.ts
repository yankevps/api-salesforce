import { Router } from 'express'
import SalesForceController from '../../presentation/controllers/sales-force-controller'

const salesForce = new SalesForceController()

export default (router: Router): void => {
  router.post('/sales-force', salesForce.post)
}
