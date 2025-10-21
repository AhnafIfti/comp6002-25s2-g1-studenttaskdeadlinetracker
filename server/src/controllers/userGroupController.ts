import { Request, Response } from "express";
import Group from "../model/group";
import User from "../model/user";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Create a group, optionally add members by email (only existing users allowed)
export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const creatorId = req.user?.id;
    const { name, memberEmails = [] } = req.body;

    if (!creatorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!name || typeof name !== "string") {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    // Find existing users for given emails
    const users = memberEmails.length
      ? await User.find({ email: { $in: memberEmails } }).select("_id email")
      : [];
    const foundEmails = users.map((u) => u.email);
    const missing = memberEmails.filter(
      (e: string) => !foundEmails.includes(e)
    );

    if (missing.length) {
      res
        .status(400)
        .json({
          message: "Some member emails do not correspond to existing users",
          missing,
        });
      return;
    }

    const memberIds = users.map((u) => u._id);

    const group = new Group({
      name,
      members: memberIds,
      createdBy: creatorId,
    });

    await group.save();

    const populated = await group.populate(
      "members",
      "firstName lastName email"
    );

    res.status(201).json({ message: "Group created", group: populated });
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupsForUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Groups where user is member or creator
    const groups = await Group.find({
      $or: [{ createdBy: userId }, { members: userId }],
    }).populate("members", "firstName lastName email");

    res.status(200).json({ groups });
  } catch (err) {
    console.error("getGroupsForUser error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const group = await Group.findById(id).populate(
      "members",
      "firstName lastName email"
    );
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Ensure user is member or creator
    const isMemberOrCreator =
      group.createdBy?.toString() === userId ||
      group.members.some((m) => m._id.toString() === userId);
    if (!isMemberOrCreator) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.status(200).json({ group });
  } catch (err) {
    console.error("getGroupById error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update group: change name, add members by email, remove members by id
export const updateGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, addMemberEmails = [], removeMemberIds = [] } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const group = await Group.findById(id);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Only creator can rename or remove members / delete group
    const isCreator = group.createdBy?.toString() === userId;
    if (!isCreator && (name || removeMemberIds.length)) {
      res
        .status(403)
        .json({ message: "Only group creator can rename or remove members" });
      return;
    }

    if (name) group.name = name;

    // Add members by email (only existing users allowed)
    if (addMemberEmails.length) {
      const users = await User.find({ email: { $in: addMemberEmails } }).select(
        "_id email firstName lastName"
      );
      const foundEmails = users.map((u) => u.email);
      const missing = addMemberEmails.filter(
        (e: string) => !foundEmails.includes(e)
      );
      if (missing.length) {
        res.status(400).json({ message: "Some emails not found", missing });
        return;
      }

      const idsToAdd = users.map((u) => u.id.toString());
      // avoid duplicates
      const existingIds = group.members.map((m) => m.toString());
      idsToAdd.forEach((idToAdd) => {
        if (!existingIds.includes(idToAdd)) group.members.push(idToAdd);
      });
    }

    // Remove members by id (only creator allowed)
    if (removeMemberIds.length) {
      group.members = group.members.filter(
        (m) => !removeMemberIds.includes(m.toString())
      );
    }

    await group.save();
    const populated = await group.populate(
      "members",
      "firstName lastName email"
    );

    res.status(200).json({ message: "Group updated", group: populated });
  } catch (err) {
    console.error("updateGroup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const group = await Group.findById(id);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.createdBy?.toString() !== userId) {
      res.status(403).json({ message: "Only creator can delete the group" });
      return;
    }

    await Group.findByIdAndDelete(id);
    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error("deleteGroup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
