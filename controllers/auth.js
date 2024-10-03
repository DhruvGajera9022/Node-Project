const bcrypt = require("bcrypt");
const Users = require("../models/user");
require("dotenv").config();
const { check, validationResult } = require('express-validator');

// To display login page
const loginPage = (req, res) => {
    res.render("login_page", { errorMsg: [] });
};

// To check user credentials
const loginUser = async (req, res) => {
    const errorMsg = [];
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(err => errorMsg.push(err.msg));
        return res.render("login_page", { errorMsg });
    }

    let { email, password } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user) {
        errorMsg.push("Invalid email or password.");
        return res.render("login_page", { errorMsg });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        return res.redirect("/dashboard");
    } else {
        errorMsg.push("Invalid email or password.");
        return res.render("login_page", { errorMsg });
    }
};

const validateLogin = [
    check('email', 'Email is required').isEmail().withMessage('Enter a valid email'),
    check('password', 'Password is required').notEmpty(),
];

// To display register page
const registerPage = (req, res) => {
    res.render("register_page", { errorMsg: [] });
};

// To create a new user
const registerUser = async (req, res) => {
    const errorMsg = [];
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(err => errorMsg.push(err.msg));
        return res.render("register_page", { errorMsg });
    }

    let { fullname, email, password } = req.body;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
        errorMsg.push("User with this email already exists.");
        return res.render("register_page", { errorMsg });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

    const isUserCreated = await Users.create({
        fullName: fullname,
        email: email,
        password: hashedPassword,
    });

    if (isUserCreated) {
        res.redirect("/");
    } else {
        errorMsg.push("User registration failed.");
        return res.render("register_page", { errorMsg });
    }
};

const validateRegistration = [
    check('fullname', 'Full name is required').notEmpty(),
    check('email', 'Email is required').isEmail().withMessage('Enter a valid email'),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    check('confirmpassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
];

// To display forgot-password page
const forgotPassword = (req, res) => {
    res.render("forgot_password", { errorMsg: [] });
};

// To handle forgot-password
const checkEmail = async (req, res) => {
    const errorMsg = [];
    const errors = validationResult(req);
    let { email } = req.body;

    if (!errors.isEmpty()) {
        errors.array().forEach(err => errorMsg.push(err.msg));
        return res.render("forgot_password", { errorMsg });
    }

    const user = await Users.findOne({ where: { email } });

    if (user) {
        res.redirect(`/recover_password/${user.id}`);
    } else {
        errorMsg.push("No user found with that email");
        return res.render("forgot_password", { errorMsg });
    }
};

const validateForgotPassword = [
    check('email', 'Email is required').isEmail().withMessage('Enter a valid email')
];

// To display recover-password
const recoverPassword = (req, res) => {
    const id = req.params.id;
    res.render("recover_password", { userId: id, errorMsg: [] });
};

// To change password
const changePassword = async (req, res) => {
    const errorMsg = [];
    const id = req.params.id;
    let { password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(err => errorMsg.push(err.msg));
        return res.render("recover_password", { userId: id, errorMsg });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

    const isPasswordUpdated = await Users.update(
        { password: hashedPassword },
        { where: { id: id } }
    );

    if (isPasswordUpdated > 0) {
        return res.redirect("/");
    } else {
        errorMsg.push("User not found or password update failed.");
        return res.render("recover_password", { userId: id, errorMsg });
    }
};

const validatePasswordChange = [
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    check('confirmpassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
];

module.exports = {
    loginPage,
    loginUser,
    validateLogin,

    registerPage,
    registerUser,
    validateRegistration,

    forgotPassword,
    checkEmail,
    validateForgotPassword,

    recoverPassword,
    changePassword,
    validatePasswordChange,
};
