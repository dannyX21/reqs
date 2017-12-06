let express = require('express');
let router = express.Router();
let jwt = require('express-jwt');
let auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: "payload"
});

let ctrlRequisitions = require('../controllers/requisitions');
let ctrlAuth = require('../controllers/authentication');
let ctrlVendors = require('../controllers/vendors');
let ctrlAccounts = require('../controllers/accounts');
let ctrlUsers = require('../controllers/users');
let ctrlFile = require('../controllers/files');

router.get('/requisitions', auth, ctrlRequisitions.getRequisitions);
router.get('/requisitions/:requisitionid', auth, ctrlRequisitions.requisitionsReadOne)
router.post('/requisitions', auth, ctrlRequisitions.requisitionsCreate);
router.put('/requisitions/:requisitionid', auth, ctrlRequisitions.requisitionUpdateOne);

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.get('/users', ctrlUsers.getUsers);
router.get('/user/:userid', ctrlUsers.userReadOne);
router.get('/delegatingusers/', ctrlUsers.getDelegatingUsers);
router.put('/user/:userid', ctrlUsers.userUpdateOne);

router.get('/vendors', ctrlVendors.getVendors);

router.post('/accounts', ctrlAccounts.createAccount);
router.get('/accounts', ctrlAccounts.getAccounts);
router.get('/accountsMin', ctrlAccounts.getAccountsMin);
router.get('/accounts/:accountid', ctrlAccounts.accountsReadOne);
router.get('/accountByNum/:number', ctrlAccounts.accountsReadOneByNumber);
router.put('/accounts/:accountid', ctrlAccounts.accountsUpdateOne);

router.post('/upload', ctrlFile.uploadFile);

module.exports = router;
