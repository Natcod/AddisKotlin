import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './interfaces/routes/searchRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/search', searchRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Addis Lyrics Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
