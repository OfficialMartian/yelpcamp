const User = require('../models/User');

module.exports.registerForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async(req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err)
                return next(err);
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds');
        })
        req.flash('success', 'Welcome to YelpCamp');
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
    delete req.session.returnTo;
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged Out');
    res.redirect('/campgrounds');
}