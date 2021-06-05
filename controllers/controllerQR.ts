import { Request, Response } from 'express';
import ResponseObj from '../modules/responseObj';
import * as jwt from '../modules/moduleJWT';
import qrcode from 'qrcode';

interface UserAgent {
	ip: string,
	browser: string,
	os: string,
	source: string
}

// *Generate QRCode
export const generateQR = async (req:Request, res:Response) => {
	let response = new ResponseObj();
	const serviceName = 'generateQR';

	try{
		const sessId = await generateSessId();
		let data:UserAgent = {
			ip: req['ip'],
			browser: req['useragent']['browser'],
			os: req['useragent']['os'],
			source: req['useragent']['source']
		}
		let qrImage = await qrcode.toDataURL(`http://localhost:3000/api/v1/qr/authorizedQR/${sessId}`);
		let token = jwt.signJWT(data);
		let result = {
			qrImage,
			state: 'NEW',
			url: `http://localhost:3000/api/v1/qr/authorized/${sessId}`
		}
		const admin = req['fbAdmin'];
		let db = admin.firestore();
		await db.collection('qrcodes').doc(sessId).set({
			token: token,
			state: 'NEW',
			expired_timestamp: new Date(new Date().valueOf()+(60000))
		});
		response.setResponse(serviceName, 200, null, true, result);
		return res.send(response)
	}catch(err){
		response.setResponse(serviceName, 500, err.message, false, null);
		return res.send(response)
	}
}

// *Querying state on QRCode
export const checkState = async (req:Request, res:Response) => {
	let response = new ResponseObj();
	const serviceName = 'checkState';
	try{
		const sessId = req.body.sess_id ?? null;
		if(sessId === null){
			response.setResponse(`${serviceName}`, 400, "Parameter not found", false, null);
			return res.status(400).send(response);
		}
		const admin = req['fbAdmin'];
		let db = admin.firestore();
		let ref = db.collection('qrcodes').doc(sessId)
		const doc = await ref.get()
		if(!doc.exists){
			response.setResponse(`${serviceName}`, 400, "Document value not found", false, null);
			return res.status(400).send(response);
		}

		let state = doc.data().state;
		if(state === 'EXPIRED'){
			await ref.delete();
		}else{
			let expiredTimestamp = doc.data().expired_timestamp;
			let exp = new Date(expiredTimestamp.toDate()).valueOf();
			if(exp.valueOf() <= new Date().valueOf()){
				state = 'EXPIRED'
				await ref.delete();
			}
		}

		let returnData = {
			state
		};
		response.setResponse(serviceName, 200, null, true, returnData);
		return res.send(response)
	}catch(err){
		response.setResponse(serviceName, 500, err.message, false, null);
		return res.send(response)
	}
}

// *Verify device info before authentication
export const checkAuthorizedState = async (req:Request, res:Response) => {
	let response = new ResponseObj();
	const serviceName = 'checkAuthorizedState';
	try{
		const sessId = req.params.sess_id ?? null;
		if(sessId === null){
			response.setResponse(`${serviceName}`, 400, "Parameter not found", false, null);
			return res.status(400).send(response);
		}
		const admin = req['fbAdmin'];
		let db = admin.firestore();
		let ref = db.collection('qrcodes').doc(sessId)
		const doc = await ref.get();
		if(!doc.exists){
			response.setResponse(`${serviceName}`, 400, "Document value not found", false, null);
			return res.status(400).send(response);
		}

		let state = doc.data().state;
		if(state === 'NEW'){
			await ref.update({ state: 'SCAN' });
		}

		let deviceInfo = jwt.decodeJWT(doc.data().token);
		if(!deviceInfo['status']){
			response.setResponse(`${serviceName}`, 400, "Invalid Token", false, null);
			return res.status(400).send(response);
		}
		response.setResponse(serviceName, 200, null, true, deviceInfo);
		return res.send(response)
	}catch(err){
		response.setResponse(serviceName, 500, err.message, false, null);
		return res.send(response)
	}
}

// *Authorize accepted and authentication
export const authorizeDevice = async (req:Request, res:Response) => {
	let response = new ResponseObj();
	const serviceName = 'authorizeDevice';
	try{
		const sessId = req.body.sess_id ?? null;
		if(sessId === null){
			response.setResponse(`${serviceName}`, 400, "Parameter not found", false, null);
			return res.status(400).send(response);
		}
		const admin = req['fbAdmin'];
		let db = admin.firestore();
		let ref = db.collection('qrcodes').doc(sessId)
		const doc = await ref.get()
		if(!doc.exists){
			response.setResponse(`${serviceName}`, 400, "Document value not found", false, null);
			return res.status(400).send(response);
		}

		let state = doc.data().state;
		if(state !== 'SCAN'){
			response.setResponse(`${serviceName}`, 400, "State not found", false, null);
			return res.status(400).send(response);
		}

		// *Authentication logical here
		// ...
		// ...
		
		await ref.update({ state: 'EXPIRED' });
		response.setResponse(serviceName, 200, null, true, true);
		return res.send(response)
	}catch(err){
		response.setResponse(serviceName, 500, err.message, false, null);
		return res.send(response)
	}
}

// *Generate Session Id for QRcode (32btye)
async function generateSessId() :Promise<string> {
	const nanoid = await import('nanoid');
	return nanoid.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 32)()
}