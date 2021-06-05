class ResponseObjClass {
	serviceName: string = '';
	status: boolean = false;
	statusCode: number = 404;
	message: (string|null) = 'Not found';
	response: any;

	setResponse(serviceName:string, statusCode:number, message:(string|null), status:boolean, response:any) : Object {
		this.serviceName = serviceName;
		this.status = status;
		this.statusCode = statusCode;
		this.message = message;
		this.response = response;

		return {
			serviceName : this.serviceName,
			status : this.status,
			statusCode : this.statusCode,
			message : this.message,
			response : this.response,
		}
	}
}

export default ResponseObjClass;
