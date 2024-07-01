import { asfterSearchService } from "./searchservice"



const afterSearch  =async(req,res)=>{
  await asfterSearchService.asfterSearch(req,res)
}

const FareRule  =async(req,res)=>{
  await asfterSearchService.fareRule(req,res)
}


export const indigocontroller ={
  afterSearch,
  FareRule
}