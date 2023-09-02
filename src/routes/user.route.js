const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.route("/").get(userController.getAllUsers); // localhost:3000/api/v1/users
router.route("/id/:id").get(userController.getUserById); // localhost:3000/api/v1/users/id/1
router.route("/username/:username").get(userController.getUserByuserName); // localhost:3000/api/v1/users/usersname/julia
router.route("/whoami").get(userController.getCurrentUser); // localhost:3000/api/v1/users/whoami
router.route("/").post(userController.createUser); // localhost:3000/api/v1/users
router.route("/id/:id").patch(userController.updateUser); // localhost:3000/api/v1/users/id/1 , using patch for partial update
router.route("/id/:id").delete(userController.deleteUser); // localhost:3000/api/v1/users/id/1

router.route("/login").post(userController.userLogin); // localhost:3000/api/v1/users/login

module.exports = router;
