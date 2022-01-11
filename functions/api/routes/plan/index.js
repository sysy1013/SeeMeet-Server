const express = require('express');
const router = express.Router();


router.get('/:month', require('./planMonthGET'));
router.get('/detail/:planId', require('./planDetailGET'));
module.exports = router;