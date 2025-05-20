const categoryModel = require('../models/categoryModel');

exports.getCategories = (req, res) => {
  try {
    const { q, page, limit, sort } = req.query;
    const result = categoryModel.getAllCategories({ q, page: Number(page) || 1, limit: Number(limit) || 20, sort });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    const category = categoryModel.createCategory(name);
    res.status(201).json({ name: category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCategory = (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).json({ error: 'Thiếu thông tin tên cũ hoặc mới' });
    const updated = categoryModel.updateCategory(oldName, newName);
    res.json({ name: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Thiếu tên danh mục' });
    const deleted = categoryModel.deleteCategory(name);
    res.json({ name: deleted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 