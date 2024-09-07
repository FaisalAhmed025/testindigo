
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import onewayRouter from './search/indigosearch/indigoroute'
import { connectToDatabase } from './database/nitializeDatabase';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/v1/indigo', onewayRouter)

// app.use('/api/v1/search/indigo', onewayRouter)

app.get('/', (req, res, next) => {
  res.send('Welcome to Indigo Api Integration');
});


app.get('/', (req, res) => {
  const targetBranch = 'P4218912';
  const CREDENTIALS = 'Universal API/uAPI4444837655-83fe5101:K/s3-5Sy4c';
  const Token = Buffer.from(CREDENTIALS).toString('base64');
  res.send(`Token: ${Token}`);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

(async () => {
  try {
      const sequelize = await connectToDatabase();
      await sequelize.sync();
      console.log('Database initialized successfully.');
  } catch (error) {
      console.error('Error initializing database:', error);
  }
})();