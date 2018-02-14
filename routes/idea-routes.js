const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ensureAuthenticated = require('../helpers/auth');
// Models
require('../models/Ideas');
const Ideas = mongoose.model('ideas');

// **** Routes ****
// Ideas display list
router.get('/', ensureAuthenticated ,(req, res) => {
    Ideas.find({user: req.user.id })
    .then(ideas => {
        res.render('ideas/index', {
            ideas: ideas
        });
    })
    .catch(err => console.log(err));
});

// Ideas Delete
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Ideas.findById(req.params.id)
    .then(idea => {
        if (idea) {
            Ideas.remove({_id: req.params.id}).then(_ => {
                res.redirect('/ideas');
            });
        }
    });
});

// Ideas edit page
router.get('/edit/:id' , ensureAuthenticated , (req, res) => {
    Ideas.findById(req.params.id)
    .then(idea => {
        res.render('ideas/edit', {
            title: idea.title,
            details: idea.details,
            id: idea.id || idea._id
        });
    })
    .catch(err => console.log(err));
});

// Ideas edit form processing
router.put('/:id', ensureAuthenticated, (req, res) => {
    Ideas.update({_id: req.params.id}, {
        title: req.body.title,
        details: req.body.details
    },{multi: true})
    .then(_ => {
        res.redirect('/ideas');
    })
    .catch(err => console.log(err));
});

// Ideas add page
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Ideas add form processing
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({text: 'Invalid Title, must be atleast 5 charecters long'});
    }
    if (!req.body.details) {
        errors.push({text: 'Details must contain atleast 10 charecters'});
    }
    if (errors.length > 0 ) {
        res.render('ideas/add', {
            title: req.body.title,
            details: req.body.details,
            errors: errors
        });
    } else  {
        const newIdea = {
            title: req.body.title,
            details: req.body.details,
            user: req.user
        }
        new Ideas(newIdea).save()
        .then(() => {
            res.redirect('/ideas');
        })
        .catch(err => console.log(err));
    }
});

module.exports = router;