const express = require('express');
const router = express.Router();


router.use('/plan', require('./plan'));

router.use('/auth',require('./auth'));
router.use('/user',require('./user'));
module.exports = router;
