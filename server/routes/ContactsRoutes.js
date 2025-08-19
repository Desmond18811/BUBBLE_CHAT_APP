// routes/contactRoutes.js
import express from "express";
import { searchUsers, addContact, getContactsForDMList } from "../controllers/ContactsController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/search", verifyToken, searchUsers);
router.post("/add", verifyToken, addContact);
router.get("/get-contacts-for-dm", verifyToken, getContactsForDMList);

export default router;

