const URL = "http://127.0.0.1:54321/rest/v1/produtos";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const headers = {
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal"
};

const items = [
  { nome: 'Água mineral 500ml', preco_venda: 3.00 },
  { nome: 'Água com gás 500ml', preco_venda: 4.00 },
  { nome: 'Água de 1,5L', preco_venda: 5.00 },
  { nome: 'Refri de litro', preco_venda: 8.00 },
  { nome: 'Refri de dois litros', preco_venda: 14.00 },
  { nome: 'Cerveja lata', preco_venda: 5.00 },
  { nome: 'Heineken shot', preco_venda: 8.00 },
  { nome: 'Heineken normal', preco_venda: 10.00 },
  { nome: 'Coronita', preco_venda: 8.00 },
  { nome: 'Monster', preco_venda: 12.00 },
  { nome: 'Guaraná Kuat', preco_venda: 5.00 },
  { nome: 'Coca lata', preco_venda: 5.00 },
  { nome: 'Cuscuz com ovo', preco_venda: 16.00 },
  { nome: 'Lavanderia (por peça)', preco_venda: 4.00 }
];

async function seed() {
  try {
    // Apagar tudo primeiro
    const delRes = await fetch(URL + "?id=gt.00000000-0000-0000-0000-000000000000", { method: 'DELETE', headers });
    console.log("Delete status:", delRes.status);
    
    // Inserir os novos
    const postRes = await fetch(URL, { method: 'POST', headers, body: JSON.stringify(items) });
    console.log("Insert status:", postRes.status);
  } catch(e) {
    console.error(e);
  }
}

seed();
