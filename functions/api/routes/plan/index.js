const express = require('express');
const router = express.Router();


router.get('/response/:dateId', require('./planDateGET'));
router.get('/:year/:month', require('./planMonthGET'));
router.get('/detail/:planId', require('./planDetailGET'));
module.exports = router;