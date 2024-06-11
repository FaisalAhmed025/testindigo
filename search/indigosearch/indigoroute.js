
import express from 'express'
import { indigocontroller } from './indigocontroler'

const router = express.Router()

//oneway
router.get('/oneway/aftersearch', indigocontroller.afterSearch  )


export default router;