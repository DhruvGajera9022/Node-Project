const { check, validationResult } = require('express-validator');

const Role = require("../models/role");
const sessionHelper = require("../helpers/session_helper");


// To display role page
const roles = async (req, res) => {
    const data = await sessionHelper.loggedInUserData(req);
    let allData = await Role.findAll({});

    res.render("role/role", { title: "Role", userData: data, allData });
}



// To render page according to add or edit request
const displayRolePage = async (req, res) => {
    // Get logged-in user data from session
    const data = await sessionHelper.loggedInUserData(req);

    // Operation on role
    const id = req.params.id;

    // Fetch user data for the given ID
    if (id) {
        const role = await Role.findOne({ where: { id } });
        if (role) {
            res.render("role/add_role", {
                title: "Edit Role",
                userData: data,
                role: role
            });
        } else {
            return res.status(404).send("Role not found.");
        }
    } else {
        // Render the page for adding a new user
        res.render("role/add_role", {
            title: "Add Role",
            userData: data,
            role: null,
        });
    }
}
// To add-edit role
const addOrEditRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { id, title, description } = req.body;

    if (id) {
        // edit role
        const isRoleUpdated = await Role.update({
            title: title,
            description: description,
        }, { where: { id: id } });
        if (isRoleUpdated > 0) {
            res.redirect("/role");
        }
    } else {
        // add role
        const isRoleAdded = await Role.create({
            title: title,
            description: description,
        });
        if (isRoleAdded) {
            res.redirect("/role");
        }
    }
}
// To delete role
const deleteRole = async (req, res) => {
    const id = req.params.id;
    await Role.destroy({ where: { id } });
    res.redirect("/role");
}
// To validate user fields
const roleValidationRules = [
    check('title')
        .trim()
        .isLength({ min: 1 }).withMessage('Title is required.'),
];



module.exports = {
    roles,

    displayRolePage,
    addOrEditRole,
    deleteRole,
    roleValidationRules,
};