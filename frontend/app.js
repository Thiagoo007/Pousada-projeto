// Credentials from .env
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const tableBody = document.getElementById('guestsTableBody');
const emptyState = document.getElementById('empty-state');
const addModal = document.getElementById('addModal');
const addBtn = document.getElementById('addBtn');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const addForm = document.getElementById('addForm');

// Payment Modal Elements
const payModal = document.getElementById('payModal');
const closePayModal = document.getElementById('closePayModal');
const cancelPayModal = document.getElementById('cancelPayModal');
const payForm = document.getElementById('payForm');
const payHospedeId = document.getElementById('payHospedeId');
const payValor = document.getElementById('payValor');
const payMetodo = document.getElementById('payMetodo');

// Metrics Elements
const totalRevenueEl = document.getElementById('totalRevenue');
const activeGuestsEl = document.getElementById('activeGuests');
const pendingPaymentsEl = document.getElementById('pendingPayments');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const toastContainer = document.getElementById('toastContainer');

// Utility: Show Toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utility: Format Date
function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Render Table
function renderTable(data) {
  tableBody.innerHTML = '';
  
  if (!data || data.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  data.forEach(guest => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Nome">${guest.nome_completo}</td>
      <td data-label="CPF">${guest.cpf}</td>
      <td data-label="Telefone">${guest.telefone || '-'}</td>
      <td data-label="Check-in">${formatDate(guest.data_checkin)}</td>
      <td data-label="Check-out">${formatDate(guest.data_checkout)}</td>
      <td data-label="Quarto"><strong>${guest.numero_quarto}</strong></td>
      <td data-label="Status" id="status-cell-${guest.id}"><span class="status-badge status-${guest.status_pagamento}">${guest.status_pagamento}</span></td>
      <td data-label="Ações">
        <button class="secondary-btn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;" onclick="openPayModal('${guest.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Pagar
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Fetch Dashboard Metrics
async function fetchMetrics() {
  try {
    // 1. Faturamento Total
    const { data: payData, error: payError } = await supabase
      .from('pagamentos')
      .select('valor');
    if (payError) throw payError;
    
    const faturamento = payData.reduce((acc, curr) => acc + curr.valor, 0);
    totalRevenueEl.innerText = `R$ ${faturamento.toFixed(2).replace('.', ',')}`;

    // 2. Hóspedes e Pendentes
    const { data: hospData, error: hospError } = await supabase
      .from('hospedes')
      .select('status_pagamento');
    if (hospError) throw hospError;

    const ativos = hospData.length;
    const pendentes = hospData.filter(h => h.status_pagamento === 'pendente').length;

    activeGuestsEl.innerText = ativos;
    pendingPaymentsEl.innerText = pendentes;

  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
  }
}

// Fetch All Guests
async function fetchGuests() {
  try {
    const { data, error } = await supabase
      .from('hospedes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    renderTable(data);
    fetchMetrics(); // Atualiza os cards sempre que carregar a tabela
  } catch (error) {
    console.error(error);
    showToast('Erro ao carregar hóspedes', 'error');
  }
}

// Search by Room
async function searchByRoom() {
  const room = searchInput.value.trim();
  if (!room) return fetchGuests();

  try {
    const { data, error } = await supabase
      .from('hospedes')
      .select('*')
      .eq('numero_quarto', room)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    
    renderTable(data);
    clearBtn.style.display = 'inline-block';
    if(data.length === 0) showToast('Nenhum hóspede neste quarto', 'warning');
  } catch (error) {
    console.error(error);
    showToast('Erro na pesquisa', 'error');
  }
}

// Clear Search
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  fetchGuests();
});

searchBtn.addEventListener('click', searchByRoom);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchByRoom();
});

// Modal Logic
function openModal() {
  addModal.classList.add('active');
}

function closeAddModal() {
  addModal.classList.remove('active');
  addForm.reset();
}

addBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeAddModal);
cancelModal.addEventListener('click', closeAddModal);

// Pay Modal Logic
function openPayModal(id) {
  payHospedeId.value = id;
  payModal.classList.add('active');
}

function closePaymentModal() {
  payModal.classList.remove('active');
  payForm.reset();
}

closePayModal.addEventListener('click', closePaymentModal);
cancelPayModal.addEventListener('click', closePaymentModal);

// Validation & Formatting
function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // Remove non-digits
  if (cpf.length !== 11) return false;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function validateCPF(cpf) {
  // Now we just check if formatCPF returned a string
  return formatCPF(cpf) !== false;
}

// Loading Utility
function setLoading(modalPrefix, formEl, isLoading) {
  const overlay = document.getElementById(`${modalPrefix}ModalLoading`);
  const submitBtn = formEl.querySelector('button[type="submit"]');
  if (isLoading) {
    overlay.classList.add('active');
    submitBtn.disabled = true;
  } else {
    overlay.classList.remove('active');
    submitBtn.disabled = false;
  }
}

// Add Guest
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const quarto = document.getElementById('quarto').value.trim();
  const status = document.getElementById('status').value;

  if (!nome || !cpf || !checkin || !checkout || !quarto) {
    showToast('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  if (!validateCPF(cpf)) {
    showToast('CPF inválido. Deve conter 11 dígitos.', 'error');
    return;
  }

  const formattedCpf = formatCPF(cpf);

  if (new Date(checkout) <= new Date(checkin)) {
    showToast('O check-out deve ser após o check-in', 'error');
    return;
  }

  const payload = {
    nome_completo: nome,
    cpf: formattedCpf,
    telefone,
    data_checkin: checkin,
    data_checkout: checkout,
    numero_quarto: quarto,
    status_pagamento: status
  };

  setLoading('add', addForm, true);

  try {
    const { data, error } = await supabase
      .from('hospedes')
      .insert([payload])
      .select();

    if (error) {
      if(error.code === '23505') throw new Error('CPF já cadastrado.');
      if(error.message && error.message.includes('Overbooking')) {
        throw new Error('🚫 ' + error.message);
      }
      throw error;
    }

    showToast('Hóspede cadastrado com sucesso!', 'success');
    closeAddModal();
    fetchGuests();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao cadastrar', 'error');
  } finally {
    setLoading('add', addForm, false);
  }
});

// Process Payment
payForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const hospede_id = payHospedeId.value;
  const valor = parseFloat(payValor.value);
  const metodo_pagamento = payMetodo.value;

  if (!valor || valor <= 0) {
    showToast('Insira um valor válido!', 'warning');
    return;
  }

  setLoading('pay', payForm, true);

  try {
    // 1. Inserir na tabela pagamentos
    const { error: payError } = await supabase
      .from('pagamentos')
      .insert([{
        hospede_id,
        valor,
        metodo_pagamento
      }]);

    if (payError) throw payError;

    // 2. Atualizar status na tabela hospedes para 'pago'
    const { error: updateError } = await supabase
      .from('hospedes')
      .update({ status_pagamento: 'pago' })
      .eq('id', hospede_id);

    if (updateError) throw updateError;

    showToast('Pagamento registrado com sucesso!', 'success');
    closePaymentModal();
    
    // Atualizar UI dinamicamente sem recarregar tudo (opcional)
    const cell = document.getElementById(`status-cell-${hospede_id}`);
    if (cell) {
      cell.innerHTML = `<span class="status-badge status-pago">pago</span>`;
    }
    
    fetchMetrics(); // Recalcula o total
  } catch (error) {
    console.error(error);
    showToast('Erro ao processar pagamento', 'error');
  } finally {
    setLoading('pay', payForm, false);
  }
});

// Init
fetchGuests();
