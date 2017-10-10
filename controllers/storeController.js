const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            next(null,true);
        }
        else{
            next({message:'That file type isnt allowed'}, false);;
        }
    }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    //check if theres no new file to resize
    if(!req.file){
        next(); //skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800,jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    //once we have written our photo to file system, keep going
    next();

}

exports.homePage = (req,res) => {
    console.log(req.name);
    res.render('index');
};

exports.addStore = (req,res) => {
    res.render('editStore' , { title : 'Add Store'});
};

exports.createStore = async (req,res) => {
    const store = await(new Store(req.body)).save();
    req.flash('success',`Successfuly created ${store.name}. Care to leave a review?`);
    res.redirect('/stores');
};

exports.getStores = async (req,res) => {
    //Query the database for all of the stores
    const stores = await Store.find();
    res.render('stores', {title:'Stores', stores:stores})
};

exports.editStore = async (req,res) => {
    //1. Find the store given the ID
    const store = await Store.findOne({ _id : req.params.id });
    
    //2.Confirm they are the owner of the store
    
    //3.Render out the edit form so the user can update their store
    res.render('editStore' , { title : `Edit ${store.name}`, store:store});
};

exports.updateStore = async (req,res) => {
    //find and update store
    const store = await Store.findOneAndUpdate({_id:req.params.id}, req.body, {new:true, //return the new store instead of the old
    runValidators:true
    }).exec();
    req.flash('success',`Successfuly edited <strong>${store.name}</strong>.<a href="/stores/${store.slug}"> View Store</a>`);
    //redirect them to the store and tell it worked
    res.redirect(`/stores/${store._id}/edit`);

};

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug});
    if(!store) return next();
    res.render('store', {store, title : store.name});
};

exports.getStoreByTag = async (req,res) =>{
    
    const tag =req.params.tag;
    const tagQuery = tag || { $exists:true };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags : tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    
    
    //res.json(result);
    
    res.render('tag', { tags, title: 'Tags', tag, stores });
}
