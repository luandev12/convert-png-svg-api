const router = require('express').Router();

router.use('/', require('./svg'));
router.use('/', require('./pdf'));
router.use('/', require('./toPs'));
router.use('/', require('./toEps'));

module.exports = router;
