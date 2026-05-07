const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的图片格式，只支持 JPG、PNG、GIF、WebP'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

router.post('/image', protect, adminOnly, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: '没有上传文件'
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            code: 200,
            message: '图片上传成功',
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '上传失败: ' + error.message
        });
    }
});

router.delete('/image/:filename', protect, adminOnly, (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                code: 200,
                message: '图片删除成功'
            });
        } else {
            res.status(404).json({
                code: 404,
                message: '图片不存在'
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '删除失败: ' + error.message
        });
    }
});

module.exports = router;
