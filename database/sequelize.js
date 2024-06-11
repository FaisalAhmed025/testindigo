import validateEnv from "../config/validateEnv";
import {Sequelize} from "sequelize";


console.log( {db: validateEnv.DATABASE})
const sequelize = new Sequelize(
    validateEnv.DATABASE,
    validateEnv.USER,
    validateEnv.PASSWORD,
    {
        host: validateEnv.HOST,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        timezone: "+06:00",
    }
);


(async () => {
    try {
        await sequelize.sync({force: false});
        console.log("Database synchronized successfully");
    } catch (error) {
        console.error("Error synchronizing database:", error);
    }
})();

export default sequelize;