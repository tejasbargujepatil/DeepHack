const prisma = require('../config/db');
const { slugify } = require('../utils/helpers');
const { sendSuccess } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, image, parentId } = req.body;
  const slug = slugify(name);

  const category = await prisma.category.create({
    data: { name, slug, description, image, parentId }
  });

  sendSuccess(res, 201, 'Category created successfully', category);
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await prisma.category.findMany({
    include: {
      children: true // Assuming 1 level of nesting for simplicity in this response
    },
    where: { parentId: null } // Get top level categories
  });

  sendSuccess(res, 200, 'Categories retrieved', categories);
});

exports.getCategoryById = catchAsync(async (req, res, next) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { children: true }
  });

  if (!category) return next(new AppError('Category not found', 404));

  sendSuccess(res, 200, 'Category retrieved', category);
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { name, description, image, parentId } = req.body;
  let updateData = { description, image, parentId };
  
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name);
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: updateData
  });

  sendSuccess(res, 200, 'Category updated', category);
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  await prisma.category.delete({
    where: { id: req.params.id }
  });
  sendSuccess(res, 200, 'Category deleted');
});
