const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const validate = (schema) => catchAsync(async (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      acc[curr.path[0]] = curr.message;
      return acc;
    }, {});
    
    return next(new AppError('Validation failed', 400, errors));
  }
  
  next();
});

module.exports = validate;
