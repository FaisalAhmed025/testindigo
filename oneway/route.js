
import express from 'express'
import { oneWayController } from './controller'

const router = express.Router()

router.get('/token', oneWayController.Token )
router.get('/airsearch', oneWayController.airSearch )
router.get('/onewaresponse', oneWayController.onewayResponse )

export default router;