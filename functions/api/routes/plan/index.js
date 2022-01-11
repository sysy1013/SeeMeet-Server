const express = require('express');
const router = express.Router();


router.get('/:month', require('./planMonthGET'));
module.exports = router;