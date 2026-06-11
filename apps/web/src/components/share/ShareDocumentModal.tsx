import React, { useState } from "react";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";

/**
 * ShareDocumentModal
 * Handles document sharing via email + role assignment
 */

type Props = {
  documentId: string;
  onClose: () => void;
};

export default function ShareDocumentModal({ documentId, onClose }: Props) {
  const { activeWorkspace } = useWorkspace();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);

  const shareDocument = async () => {
    setLoading(true);

    try {
      await fetch("http://localhost:4000/api/documents/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          workspaceId: activeWorkspace?.id,
          email,
          role,
        }),
      });

      setEmail("");
      onClose();
    } catch (e) {
      console.error("Share failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-[400px]">
        <h2 className="text-lg font-semibold mb-3">Share Document</h2>

        <input
          className="w-full border p-2 mb-3"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-3 py-1 bg-black text-white"
            disabled={loading || !email}
            onClick={shareDocument}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}