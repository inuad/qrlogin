import jwt from 'jsonwebtoken';

export const signJWT = (data:object, exp:string="5m") => {
	return jwt.sign(data, "!@#$%", { expiresIn: exp });
}

export const decodeJWT = (token:string) :object => {
	return jwt.verify(token, "!@#$%", (err:Error, decoded:object) => {
		if (err) {
			return {
				status: false,
				result: err
			}
		}
		return {
			status: true,
			result: decoded
		}
	})
}