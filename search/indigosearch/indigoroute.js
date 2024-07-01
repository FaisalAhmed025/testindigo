
import express from 'express'
import { indigocontroller } from './indigocontroler'

const router = express.Router()

//oneway
router.get('/aftersearch', indigocontroller.afterSearch)
router.get('/fare-rule', indigocontroller.FareRule)

export default router;