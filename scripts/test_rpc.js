(async () => {
  const url = process.env.NEXT_PUBLIC_RPC_URL || 'https://carrot.megaeth.com/rpc';
  console.log('Testing RPC URL:', url);
  try {
    // Use global fetch (Node 18+). Set a short timeout via AbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
      signal: controller.signal,
    });
    clearTimeout(id);
    console.log('HTTP status:', res.status);
    const text = await res.text();
    console.log('Response body:');
    console.log(text);
    process.exit(0);
  } catch (err) {
    console.error('RPC test failed:');
    console.error(err);
    process.exit(2);
  }
})();
