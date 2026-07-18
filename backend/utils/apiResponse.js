class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = {}, meta = {} }) {
    return res.status(statusCode).json({ success: true, message, data, meta });
  }

  static error(res, { statusCode = 500, message = 'Something went wrong' }) {
    return res.status(statusCode).json({ success: false, message, data: {}, meta: {} });
  }
}

export default ApiResponse;