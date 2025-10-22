const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function uploadAttachment(file: File): Promise<string> {
  await wait(600);
  return 'att_' + Math.random().toString(36).slice(2);
}

export async function createRequest(payload: any): Promise<{ id: string }> {
  await wait(400);
  return { id: 'req_' + Math.random().toString(36).slice(2) };
}

export async function createShipment(payload: any): Promise<{ id: string }> {
  const response = await fetch('/api/shipments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || 'mock-token'}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to create shipment: ${response.statusText}`);
  }

  return await response.json();
}




