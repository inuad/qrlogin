import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'

dotenv.config();
const app  = express();
app.set('trust proxy', true);

import fbAdmin from './modules/moduleFirebaseAdmin';
const firebaseInstance = fbAdmin();
app.use((req:Request, res:Response, next:NextFunction) => {
	req['fbAdmin'] = firebaseInstance;
	next();
})

import middlewares from './middlewares/middlewareIndex';
app.use(middlewares);

import routes from './routes/routeIndex';
app.use(routes);

app.listen(3000, () => console.log("Start server 3000"));