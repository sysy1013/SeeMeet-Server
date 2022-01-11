const express = require('express');
const router = express.Router();

router.use('/auth',require('./auth'));
router.use('/user',require('./user'));
router.use('/friend',require('./friend'));
module.exports = router;
