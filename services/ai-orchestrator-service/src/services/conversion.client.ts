const CONVERSION_URL = process.env.CONVERSION_SERVICE_URL || "http://conversion-service:4000";

export async function convertDocument(type: string, documentId: string) {
  const res = await fetch(`${CONVERSION_URL}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, documentId })
  });

  return res.json();
}
