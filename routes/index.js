const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);

router.post('/add', storeController.upload, 
                    catchErrors(storeController.resize), 
                    catchErrors(storeController.createStore));

router.post('/add/:id', storeController.upload, 
                        catchErrors(storeController.resize), 
                        catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoreByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

router.post('/register',
            userController.validateRegister,
            userController.register,
            authController.login
            );

//1.Validate register data
//2.Register user
//3.We need to log them in


module.exports = router;
