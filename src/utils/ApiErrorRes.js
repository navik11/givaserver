class ApiError extends Error {
    constructor(
        statusCode,
        messege = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(messege);
        this.statusCode = statusCode;
        this.messege = messege;
        this.success = false;
        this.error = errors;
        this.stack = stack;
    }
}

class ApiResponse {
    constructor(statusCode, data, messege = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.messege = messege;
        this.success = statusCode < 400;
    }
}

export { ApiError, ApiResponse };
