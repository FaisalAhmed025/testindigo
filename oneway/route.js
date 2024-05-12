
import express from 'express'
import { oneWayController } from './controller'

const router = express.Router()


//oneway
router.get('/oneway/token', oneWayController.Token )
router.get('/oneway/airsearch', oneWayController.airSearch)
router.get('/oneway/onewaresponse', oneWayController.RoundWayresponse )

export default router;