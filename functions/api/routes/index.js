const express = require('express');
const router = express.Router();

router.use('/invitation', require('./invitation'));

router.use('/auth',require('./auth'));
router.use('/user',require('./user'));
module.exports = router;
