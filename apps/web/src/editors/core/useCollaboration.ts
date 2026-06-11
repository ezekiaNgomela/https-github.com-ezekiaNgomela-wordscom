import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * useCollaboration
 * Client-side realtime sync layer for editor collaboration
 */

type CollaborationOptions = {
  documentId?: string;
};

export function useCollaboration({ documentId }: CollaborationOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [remoteContent, setRemoteContent] = useState<string>("");
  const [cursors, setCursors] = useState<any[]>([]);

  useEffect(() => {
    if (!documentId) return;

    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("join-document", documentId);

    socket.on("doc-update", ({ content }) => {
      setRemoteContent(content);
    });

    socket.on("cursor-update", ({ cursor }) => {
      setCursors((prev) => [...prev, cursor]);
    });

    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  const sendChange = (content: string) => {
    const socket = socketRef.current;
    if (!socket || !documentId) return;

    socket.emit("doc-change", {
      documentId,
      content,
    });
  };

  const sendCursor = (cursor: any) => {
    const socket = socketRef.current;
    if (!socket || !documentId) return;

    socket.emit("cursor-move", {
      documentId,
      cursor,
    });
  };

  return {
    remoteContent,
    cursors,
    sendChange,
    sendCursor,
  };
}
