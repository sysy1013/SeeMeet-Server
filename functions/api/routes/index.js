const express = require('express');
const router = express.Router();


router.use('/plan', require('./plan'));
router.use('/invitation', require('./invitation'));


router.use('/auth',require('./auth'));
router.use('/user',require('./user'));
router.use('/friend',require('./friend'));
module.exports = router;
