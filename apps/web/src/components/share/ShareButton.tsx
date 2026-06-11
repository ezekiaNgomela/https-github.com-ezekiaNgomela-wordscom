import React, { useState } from "react";
import ShareDocumentModal from "./ShareDocumentModal";

/**
 * ShareButton
 * Opens share modal for documents
 */

export default function ShareButton({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="px-3 py-1 border rounded hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        Share
      </button>

      {open && (
        <ShareDocumentModal
          documentId={documentId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}