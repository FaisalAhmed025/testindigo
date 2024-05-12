import { onewayService } from "./service"



const Token =async(req,res)=>{
  await onewayService.createToken(req,res)
}


const airSearch =async(req,res)=>{
  await onewayService.AirSearch(req,res)
}

const onewayResponse =async(req,res)=>{
  await onewayService.onewayresponse(req,res)
}


export const oneWayController = {
  Token,
  airSearch,
  onewayResponse
}