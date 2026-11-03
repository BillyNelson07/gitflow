'use strict';

/** Encaminha erros de handlers assíncronos para o middleware de erro do Express 4. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
