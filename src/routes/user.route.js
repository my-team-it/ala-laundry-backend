const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers); // localhost:3000/api/v1/users
router.get("/id/:id", userController.getUserById); // localhost:3000/api/v1/users/id/1
router.get("/username/:username", userController.getUserByuserName); // localhost:3000/api/v1/users/usersname/julia
router.get("/whoami", userController.getCurrentUser); // localhost:3000/api/v1/users/whoami
router.post("/", userController.createUser); // localhost:3000/api/v1/users
router.patch("/id/:id", userController.updateUser); // localhost:3000/api/v1/users/id/1 , using patch for partial update
router.delete("/id/:id", userController.deleteUser); // localhost:3000/api/v1/users/id/1

router.post("/login", validateLogin, userController.userLogin); // localhost:3000/api/v1/users/login

module.exports = router;
