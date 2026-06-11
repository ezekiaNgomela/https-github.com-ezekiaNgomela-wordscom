import { Server } from "socket.io";
import http from "http";
import express from "express";

/**
 * Realtime Collaboration Server
 * Socket-based document syncing layer (MVP)
 *
 * Future upgrades:
 * - CRDT (Yjs)
 * - Operational transforms
 * - Presence awareness
 */

export function createRealtimeServer(app: express.Express) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-document", (documentId: string) => {
      socket.join(documentId);
    });

    socket.on("doc-change", ({ documentId, content }) => {
      socket.to(documentId).emit("doc-update", { content });
    });

    socket.on("cursor-move", ({ documentId, cursor }) => {
      socket.to(documentId).emit("cursor-update", { cursor });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return server;
}
