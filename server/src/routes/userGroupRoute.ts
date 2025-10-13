import express from "express";
import {
  createGroup,
  getGroupsForUser,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/userGroupController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticate); // protect all group routes

router.post("/", createGroup); // body: { name, memberEmails?: string[] }
router.get("/", getGroupsForUser);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup); // body: { name?, addMemberEmails?: string[], removeMemberIds?: string[] }
router.delete("/:id", deleteGroup);

export default router;
