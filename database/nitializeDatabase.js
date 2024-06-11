
import sequelize from './sequelize'


export async function connectToDatabase() {

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Now define your function to use the Admin model