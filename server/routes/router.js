

// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Controller = require('../Controller/controller');
const auth = require('basic-auth');

const USERNAME = 'printnewsapi';
const PASSWORD = 'printnews@123';

// Basic authentication middleware
const basicAuthMiddleware = (req, res, next) => {
  const credentials = auth(req);

  // Check if credentials are provided and are correct
  if (!credentials || credentials.name !== USERNAME || credentials.pass !== PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Access to API"');
    return res.status(401).json({ error: 'Unauthorized Access. Please provide valid credentials.' });
  }

  // If authenticated, move to the next middleware/route handler
  next();
};

router.get('/getNews',basicAuthMiddleware, Controller.getNews);
router.get('/getNewsContant', basicAuthMiddleware,Controller.getNewsContant);

router.get('/getproducts', Controller.getProducts);
router.post('/product_name_api', Controller.product_name_api);

router.post('/getlayouts', Controller.getLayouts);

router.get('/getzone',Controller.getZone);
router.post('/Zone_name_api',Controller.Zone_Name_api);

router.post('/pagenumber',Controller.getPageNumber);

router.post('/assignuser',Controller.assignUser);
router.post('/usercode',Controller.User_Id_api);

router.post('/uploadImages',Controller.imageUploadHandler);
router.post('/updateImages',Controller.imageUpdateHandler);
router.post('/insertArticle',Controller.insertArticle);
router.post('/updateArticle',Controller.updateArticle);
router.post('/fetchnews/id',Controller.getNewsById);
router.get('/getImageName', Controller.getImageName);
router.get('/getupdateImageName',Controller.getUpdateImageName);
router.post('/deleteImageName',Controller.deleteImageName);
router.post('/fetchnews', Controller.fetchnews);
router.post('/revokepage', Controller.fetchrevokepage);
router.post('/getUser', Controller.userdetail);
router.post('/user', Controller.adAuth);
router.post('/reporter/processedUser',Controller.processedUser);
router.post('/reporter/articleuserzoneids',Controller.articleuserzoneids);

//-----------------Profile -------------------

router.post('/updateUserName',Controller.updateUserName);


//-----------Thumbnail  Api -------------------
router.get('/reporter/products-ids',Controller.productids)
router.get('/reporter/zone-ids-by-product', Controller.zoneIdsByProduct);
router.get('/reporter/edition-id', Controller.editionId);
router.get('/reporter/pages-zones', Controller.pagesZones);
router.get('/reporter/pages-withoutzones', Controller.pagesWithoutZones);
router.get('/reporter/images', Controller.getImages);
router.get('/reporter/pdf', Controller.getPdf);
router.get('/reporter/plandata', Controller.getPlanData);




//------------------Article User----------
router.get('/article/articleuserids', Controller.articleuserids);
router.get('/article/userfilterdetail', Controller.userfilterdetail);
router.get('/getarticlestatus', Controller.articlestatus);



//-------------Revoke Api ---------------
router.post('/revokePagez',Controller.fetchrevokepage)
router.post('/updaterevoke',Controller.updatePageCompose)


// ............Active Page...............
router.post('/pageactive',Controller.updateActiveStatus)
router.post('/pageIdactive',Controller.updateActivePageStatus)
router.get('/getPageIds', Controller.fetchPageIds)
router.get('/getPageDetails', Controller.fetchPageDetails)



module.exports = router;

