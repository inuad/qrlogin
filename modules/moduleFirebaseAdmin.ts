import admin from 'firebase-admin';
const serviceAccount = require(`../config/${process.env.FBJSON}`);

export default () => {
	try{
		return admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
	}catch(err){
		console.log(err);
		process.exit();
	}
}