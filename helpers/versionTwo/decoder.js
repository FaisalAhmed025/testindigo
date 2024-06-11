import jwt from "jsonwebtoken";



 const decoder = async (token, secret) => {
    try {
        return await jwt.verify(token, secret);
    } catch (error) {
        // console.log('here')
        throw error;
    }
};

 export default decoder