import express from "express";
import { db } from "./db";
import { authMiddleware } from "./authMiddleware";

export const workspaceRouter = express.Router();

workspaceRouter.use(authMiddleware);

// create workspace
workspaceRouter.post("/create", async (req: any, res) => {
  try {
    const { name } = req.body;

    const workspace = await db.workspace.create({
      data: { name },
    });

    await db.workspaceMember.create({
      data: {
        userId: req.user.id,
        workspaceId: workspace.id,
        role: "owner",
      },
    });

    res.json(workspace);
  } catch (e) {
    res.status(500).json({ error: "workspace error" });
  }
});

// list workspaces
workspaceRouter.get("/list", async (req: any, res) => {
  try {
    const workspaces = await db.workspaceMember.findMany({
      where: { userId: req.user.id },
      include: { workspace: true },
    });

    res.json(workspaces);
  } catch (e) {
    res.status(500).json({ error: "workspace error" });
  }
});