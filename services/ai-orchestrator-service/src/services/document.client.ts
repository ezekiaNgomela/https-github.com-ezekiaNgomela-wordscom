const DOCUMENT_SERVICE_URL = process.env.DOCUMENT_SERVICE_URL || "http://document-service:4000";

export async function createDocument(payload: any) {
  const res = await fetch(`${DOCUMENT_SERVICE_URL}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res.json();
}

export async function getDocument(id: string) {
  const res = await fetch(`${DOCUMENT_SERVICE_URL}/documents/${id}`);
  return res.json();
}