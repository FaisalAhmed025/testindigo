import { asfterSearchService } from "./searchservice"



const afterSearch  =async(req,res)=>{
  await asfterSearchService.asfterSearch(req,res)
}


export const indigocontroller ={
  afterSearch
}