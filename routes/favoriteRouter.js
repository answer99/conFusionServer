const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');

var authenticate = require('../authenticate')
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate({
        path: 'dishes',
        model: 'Dish'
    })
    .then((favoirtes) => {
        res.StatusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(favoirtes)
    }, (err) => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            let add_dishes = req.body.map(n => n._id);

            favorite.dishes.forEach(n => {
                let index = add_dishes.indexOf(n.toString())                
                if(index !== -1){
                    add_dishes.splice(index,1)
                }
            })
            add_dishes.forEach(n=>{
                favorite.dishes.push(mongoose.Types.ObjectId(n));
            })
            
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate({
                    path: 'dishes',
                    model: 'Dish'
                })
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            }, (err) => next(err));
        }
        else {
            Favorites.create({
                user: req.user._id,
                dishes: req.body.map(n => n._id)
            })
            .then((favorite) => {
                console.log('favorite Created ', favorite);
                res.StatusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite)
            }, (err) => next(err))
            .catch(err => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        favorite.remove({})
        .then((resp) => {
            console.log('favorite Deleted ', resp);
            res.StatusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(resp)
        }, (err) => next(err))
        .catch(err => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user._id);
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null){
            if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(mongoose.Types.ObjectId(req.params.dishId));
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate({
                        path: 'dishes',
                        model: 'Dish'
                    })
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            }else {
                res.statusCode = 200;
                res.json("You already added");
            }
        }
        else {
            Favorites.create({
                user: req.user._id,
                dishes: req.params.dishId
            })
            .then((favorite) => {
                console.log('favorite Created ', favorite);
                res.StatusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite)
            }, (err) => next(err))
            .catch(err => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null && favorite.dishes.indexOf(req.params.dishId) != -1) {
            Favorites.findByIdAndUpdate(favorite._id, {
                $pull: { dishes: {$in: [mongoose.Types.ObjectId(req.params.dishId)]}}
            }, { new: true})
            .then((favorite) => {
                res.StatusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite)
            }, (err) => next(err))
            .catch(err => next(err));
        }else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch(err => next(err));
});

module.exports = favoriteRouter;