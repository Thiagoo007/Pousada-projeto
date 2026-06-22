document.addEventListener('DOMContentLoaded', function() {
  // console.log('[Pousada] Inicializando Dark Mode Pro Max...');

  // --- Supabase ---
  const SUPABASE_URL = "https://ukfdsvtjprpttrkpspzm.supabase.co";
  const SUPABASE_KEY = "sb_publishable_GNOcox9b0CKVlJ-mDvs6pg_5GXl1qsB";

  let supabase = null;
  if (window.supabase && window.supabase.createClient) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          storage: window.sessionStorage,
          autoRefreshToken: true
        }
      });
      // console.log('[Pousada] Supabase OK.');
      
      // --- AUTH CHECK ---
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          window.location.href = 'index.html';
        } else {
          const user = session.user;
          const loggedName = document.getElementById('loggedUserName');
          const loggedRole = document.getElementById('loggedUserRole');
          if(loggedName) loggedName.textContent = user.email.split('@')[0];
          if(loggedRole) loggedRole.textContent = 'Autenticado via Supabase';

          // --- IDLE TIMEOUT (30 MINUTOS) ---
          let idleTimer;
          const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(async () => {
              // console.log('[Segurança] Sessão expirada por inatividade.');
              if (supabase) await supabase.auth.signOut();
              window.location.replace('index.html');
            }, 30 * 60 * 1000); // 30 min = 1800000 ms
          };
          
          // Inicia a contagem
          resetIdleTimer();
          
          // Reseta a contagem se houver qualquer interação na tela
          ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetIdleTimer, { passive: true });
          });
        }
      });
      
    } catch (e) {
      console.error('[Pousada] Supabase falhou:', e);
    }
  }

  // --- DOM Elements ---
  const checkinsTodayBody = document.getElementById('checkinsTodayBody');
  const checkoutsTodayBody = document.getElementById('checkoutsTodayBody');
  const reservasFullTableBody = document.getElementById('reservasFullTableBody');
  const guestsFullTableBody = document.getElementById('guestsFullTableBody');
  
  const addModal = document.getElementById('addModal');
  const addBtn = document.getElementById('addBtn');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('cancelModal');
  const addForm = document.getElementById('addForm');
  
  const inputCheckin = document.getElementById('checkin');
  const inputCheckout = document.getElementById('checkout');
  const priceBreakdown = document.getElementById('priceBreakdown');
  const calcNightsLabel = document.getElementById('calcNightsLabel');
  const calcNightsTotal = document.getElementById('calcNightsTotal');
  const calcGrandTotal = document.getElementById('calcGrandTotal');

  const payModal = document.getElementById('payModal');
  const closePayModalBtn = document.getElementById('closePayModal');
  const cancelPayModalBtn = document.getElementById('cancelPayModal');
  const payForm = document.getElementById('payForm');
  const payHospedeId = document.getElementById('payHospedeId');
  const payHospedeNome = document.getElementById('payHospedeNome');
  const payValor = document.getElementById('payValor');
  const payMetodo = document.getElementById('payMetodo');

  const consumoModal = document.getElementById('consumoModal');
  const closeConsumoModalBtn = document.getElementById('closeConsumoModal');
  const cancelConsumoModalBtn = document.getElementById('cancelConsumoModal');
  const consumoForm = document.getElementById('consumoForm');
  const consumoReservaId = document.getElementById('consumoReservaId');
  const consumoHospedeNome = document.getElementById('consumoHospedeNome');
  const consumoProdutoId = document.getElementById('consumoProdutoId');
  const consumoQuantidade = document.getElementById('consumoQuantidade');

  const fnrhModal = document.getElementById('fnrhModal');
  const closeFnrhModalBtn = document.getElementById('closeFnrhModal');

  const totalRevenueEl = document.getElementById('totalRevenue');
  const activeGuestsEl = document.getElementById('activeGuests');
  const pendingRevenueEl = document.getElementById('pendingRevenue');
  const pendingCountEl = document.getElementById('pendingCount');

  // Configurações
  const logsAcessoTableBody = document.getElementById('logsAcessoTableBody');

  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  
  const searchReservasFull = document.getElementById('searchReservasFull');
  const searchHospedesFull = document.getElementById('searchHospedesFull');

  const toastContainer = document.getElementById('toastContainer');

  const pendenciasList = document.getElementById('pendenciasList');
  const activityList = document.getElementById('activityList');

  // --- SPA Routing ---
  const navItems = document.querySelectorAll('.nav-item');
  const pageViews = document.querySelectorAll('.page-view');
  
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  window.toggleSidebar = function() {
    if(sidebar) sidebar.classList.toggle('show');
    if(sidebarOverlay) sidebarOverlay.classList.toggle('show');
  };

  if(sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('show');
      sidebarOverlay.classList.remove('show');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      if (!targetId) return;

      navItems.forEach(n => n.classList.remove('active'));
      pageViews.forEach(v => v.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(targetId).classList.add('active');
      
      // Fecha a sidebar no mobile ao trocar de página
      if(window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('show');
        if(sidebarOverlay) sidebarOverlay.classList.remove('show');
      }
    });
  });

  // --- Utils ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    let icon = '', title = '';
    if (type === 'success') {
      title = 'Sucesso!';
      icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      title = 'Erro!';
      icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      title = 'Aviso';
      icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    toast.innerHTML = '<div class="toast-icon">' + icon + '</div><div class="toast-content"><h4>' + title + '</h4><p>' + message + '</p></div>';
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.remove(); }, 400);
    }, 4000);
  }

  function formatDate(iso) {
    if (!iso) return '-';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function getInitials(name) {
    if (!name) return '??';
    var p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  }

  function formatCurrency(val) {
    return 'R$ ' + val.toFixed(2).replace('.', ',');
  }

  function timeAgo(dateIso) {
    if(!dateIso) return '';
    const diff = Math.floor((new Date() - new Date(dateIso)) / 60000);
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return 'há ' + diff + ' min';
    const hours = Math.floor(diff / 60);
    if (hours < 24) return 'há ' + hours + ' h';
    return 'há ' + Math.floor(hours / 24) + ' dias';
  }

  function setLoading(prefix, on) {
    const overlay = document.getElementById(prefix + 'ModalLoading');
    if (overlay) {
      if (on) overlay.classList.add('active');
      else overlay.classList.remove('active');
    }
  }

  // --- Modals ---
  function openAddModal() { addModal.classList.add('active'); }
  function closeAddModal() { 
    addModal.classList.remove('active'); 
    addForm.reset(); 
    if(priceBreakdown) priceBreakdown.style.display = 'none';
  }

  function updatePriceBreakdown() {
    if (!inputCheckin || !inputCheckout || !priceBreakdown) return;
    
    if (!inputCheckin.value || !inputCheckout.value) {
      priceBreakdown.style.display = 'none';
      return;
    }

    const dIn = new Date(inputCheckin.value + "T00:00:00");
    const dOut = new Date(inputCheckout.value + "T00:00:00");
    
    if (dOut <= dIn) {
      priceBreakdown.style.display = 'none';
      return;
    }
    
    const diffTime = Math.abs(dOut - dIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const climatizacaoSelect = document.getElementById('climatizacao');
    const climatizacao = climatizacaoSelect ? climatizacaoSelect.value : 'ventilador';
    const hospedesSelect = document.getElementById('hospedesQuantidade');
    const numHospedes = hospedesSelect ? parseInt(hospedesSelect.value) : 1;
    
    const valorDiariaBase = (climatizacao === 'ar') ? 90 : 70;
    const valorDiaria = valorDiariaBase * numHospedes;
    const totalDiarias = valorDiaria * diffDays;
    const total = totalDiarias;
    
    if (calcNightsLabel) calcNightsLabel.textContent = `R$ ${valorDiaria.toFixed(2).replace('.', ',')} x ${diffDays} noites (${numHospedes} hóspede${numHospedes > 1 ? 's' : ''})`;
    if (calcNightsTotal) calcNightsTotal.textContent = `R$ ${totalDiarias.toFixed(2).replace('.', ',')}`;
    if (calcGrandTotal) calcGrandTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    priceBreakdown.style.display = valorDiaria > 0 ? 'block' : 'none';
  }

  if (inputCheckin) inputCheckin.addEventListener('change', updatePriceBreakdown);
  if (inputCheckout) inputCheckout.addEventListener('change', updatePriceBreakdown);
  const quartoSelectGlobal = document.getElementById('quarto');
  if (quartoSelectGlobal) quartoSelectGlobal.addEventListener('change', updatePriceBreakdown);
  const climatizacaoSelectGlobal = document.getElementById('climatizacao');
  if (climatizacaoSelectGlobal) climatizacaoSelectGlobal.addEventListener('change', updatePriceBreakdown);
  const hospedesSelectGlobal = document.getElementById('hospedesQuantidade');
  if (hospedesSelectGlobal) hospedesSelectGlobal.addEventListener('change', updatePriceBreakdown);

  window.openPayModal = function(id, name, room) {
    payHospedeId.value = id;
    payHospedeNome.value = name + ' - Quarto ' + room;
    payModal.classList.add('active');
  }
  function closePayModal() { payModal.classList.remove('active'); payForm.reset(); }

  window.openConsumoModal = function(reserva_id, name, room) {
    consumoReservaId.value = reserva_id;
    consumoHospedeNome.value = name + ' - Quarto ' + room;
    consumoModal.classList.add('active');
  }
  function closeConsumoModal() { consumoModal.classList.remove('active'); consumoForm.reset(); }

  window.openFnrhModal = function(nome, cpf, telefone, quarto, checkin, checkout) {
    document.getElementById('fnrhNome').textContent = nome || '-';
    document.getElementById('fnrhCpf').textContent = cpf || '-';
    document.getElementById('fnrhTelefone').textContent = telefone || '-';
    document.getElementById('fnrhQuarto').textContent = quarto || '-';
    document.getElementById('fnrhCheckin').textContent = checkin ? new Date(checkin).toLocaleDateString('pt-BR') : '-';
    document.getElementById('fnrhCheckout').textContent = checkout ? new Date(checkout).toLocaleDateString('pt-BR') : '-';
    fnrhModal.classList.add('active');
  }
  function closeFnrhModal() { fnrhModal.classList.remove('active'); }

  // Status Modifiers
  window.doCheckin = async function(reserva_id) {
    if(!supabase) return showToast('Modo offline', 'warning');
    try {
      const {error} = await supabase.from('reservas').update({status: 'check-in'}).eq('id', reserva_id);
      if(error) throw error;
      showToast('Check-in realizado!');
      fetchAll();
    } catch(e) {
      showToast(e.message, 'error');
    }
  };

  window.doCancel = async function(reserva_id) {
    if(!supabase) return showToast('Modo offline', 'warning');
    if(!confirm('Tem certeza que deseja cancelar esta reserva? A ação não pode ser desfeita.')) return;
    try {
      const {error} = await supabase.from('reservas').update({status: 'cancelada'}).eq('id', reserva_id);
      if(error) throw error;
      showToast('Reserva cancelada com sucesso!');
      fetchAll();
    } catch(e) {
      showToast(e.message, 'error');
    }
  }

  window.doCheckout = async function(reserva_id, hospede_id) {
    if(!supabase) return showToast('Modo offline', 'warning');
    setLoading('pay', true);
    try {
      // 1. Liberação do Mapa de Ocupação: Atualiza o status da reserva para check-out
      const {error: errRes} = await supabase.from('reservas').update({status: 'check-out'}).eq('id', reserva_id);
      if(errRes) throw errRes;
      
      // 2. Calcula total de consumos dessa reserva
      let totalConsumo = 0;
      const {data: consData, error: errCons} = await supabase.from('consumos').select('valor_total_item').eq('reserva_id', reserva_id);
      if(!errCons && consData) {
        totalConsumo = consData.reduce((acc, c) => acc + Number(c.valor_total_item), 0);
      }

      // 3. Atualização de Pagamento: Busca o pagamento pendente associado ao hóspede
      const { data: payData, error: errGetPay } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('hospede_id', hospede_id)
        .eq('status', 'pendente')
        .order('id', { ascending: false })
        .limit(1)
        .single();
        
      let valorFinalDescricao = 0;

      if (!errGetPay && payData) {
        // Encontrou o pagamento original das diárias. Somamos os consumos nele.
        const novoValorConsolidado = Number(payData.valor) + totalConsumo;
        valorFinalDescricao = novoValorConsolidado;
        
        const {error: errUpdPay} = await supabase
          .from('pagamentos')
          .update({ valor: novoValorConsolidado })
          .eq('id', payData.id);
          
        if(errUpdPay) throw errUpdPay;
      } else if (totalConsumo > 0) {
        // Se por algum motivo o hóspede não tiver pagamento pendente (já pagou a diária adiantado),
        // e ele tem consumo, gera um novo pagamento pendente apenas do consumo.
        valorFinalDescricao = totalConsumo;
        const {error: errPay} = await supabase.from('pagamentos').insert([{
          hospede_id: hospede_id,
          valor: totalConsumo,
          metodo_pagamento: 'pendente',
          status: 'pendente'
        }]);
        if(errPay) throw errPay;
      } else {
        // Sem pendências e sem consumo
        valorFinalDescricao = 0;
      }

      showToast(`Check-out concluído! Conta atualizada: R$ ${valorFinalDescricao.toFixed(2)}`);
      fetchAll(); // Isso fará a tabela e o mapa de ocupação atualizarem
    } catch(e) {
      console.error(e);
      showToast(e.message, 'error');
    } finally {
      setLoading('pay', false);
    }
  };

  // Details Modal
  const detailsModal = document.getElementById('detailsModal');
  const closeDetailsModalBtn = document.getElementById('closeDetailsModal');
  const cancelDetailsModalBtn = document.getElementById('cancelDetailsModal');

  window.openDetailsModal = async function(id) {
    const reserva = allReservas.find(r => r.id == id);
    if(!reserva) return;

    document.getElementById('detNome').textContent = reserva.hospedes?.nome_completo || 'Hóspede';
    document.getElementById('detTelefone').textContent = reserva.hospedes?.telefone || 'Não informado';
    document.getElementById('detQuarto').textContent = 'Quarto ' + reserva.numero_quarto;
    
    const statusBadge = document.getElementById('detStatusBadge');
    statusBadge.className = 'badge badge-' + reserva.status;
    statusBadge.textContent = reserva.status.toUpperCase();

    document.getElementById('detCheckin').textContent = formatDate(reserva.data_checkin);
    document.getElementById('detCheckout').textContent = formatDate(reserva.data_checkout);
    
    // 1. Duração
    const dIn = new Date(reserva.data_checkin);
    const dOut = new Date(reserva.data_checkout);
    const diffDays = Math.ceil(Math.abs(dOut - dIn) / (1000 * 60 * 60 * 24));
    document.getElementById('detDias').textContent = diffDays + (diffDays === 1 ? ' noite' : ' noites');

    // 2. Consumos e Totais
    let consumosHtml = '';
    let totalConsumo = 0;
    try {
      const { data: consData, error } = await supabase.from('consumos').select('*, produtos(nome)').eq('reserva_id', id);
      if (!error && consData && consData.length > 0) {
        consData.forEach(c => {
          totalConsumo += Number(c.valor_total_item);
          const pName = c.produtos?.nome || 'Produto Indefinido';
          consumosHtml += `<li style="padding: 0.3rem 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
            <span>${c.quantidade}x ${pName}</span>
            <span>R$ ${Number(c.valor_total_item).toFixed(2).replace('.',',')}</span>
          </li>`;
        });
      } else {
        consumosHtml = '<li style="color: var(--text-muted);">Nenhum consumo registrado.</li>';
      }
    } catch(e) {
      consumosHtml = '<li style="color: var(--danger);">Erro ao carregar consumos.</li>';
    }
    document.getElementById('detConsumosList').innerHTML = consumosHtml;

    // 3. Financeiro
    const valorReserva = Number(reserva.valor_total) || 0;
    const totalGeral = valorReserva + totalConsumo;
    
    // Busca pagamentos atrelados ao hóspede
    const pagamentosHospede = allPagamentos.filter(p => p.hospede_id === reserva.hospede_id && p.status !== 'pendente' && p.metodo_pagamento !== 'pendente');
    const valorPago = pagamentosHospede.reduce((acc, p) => acc + Number(p.valor), 0);
    const valorPendente = Math.max(0, totalGeral - valorPago);

    document.getElementById('detValorPago').textContent = formatCurrency(valorPago);
    document.getElementById('detValorPendente').textContent = formatCurrency(valorPendente);
    document.getElementById('detValorTotal').textContent = formatCurrency(totalGeral);

    detailsModal.classList.add('active');
  }
  
  function closeDetailsModal() { detailsModal.classList.remove('active'); }
  
  if(closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
  if(cancelDetailsModalBtn) cancelDetailsModalBtn.addEventListener('click', closeDetailsModal);

  // Bind UI events
  if(addBtn) addBtn.addEventListener('click', openAddModal);
  if(closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if(cancelModalBtn) cancelModalBtn.addEventListener('click', closeAddModal);

  if(closePayModalBtn) closePayModalBtn.addEventListener('click', closePayModal);
  if(cancelPayModalBtn) cancelPayModalBtn.addEventListener('click', closePayModal);

  if(closeConsumoModalBtn) closeConsumoModalBtn.addEventListener('click', closeConsumoModal);
  if(cancelConsumoModalBtn) cancelConsumoModalBtn.addEventListener('click', closeConsumoModal);

  if(closeFnrhModalBtn) closeFnrhModalBtn.addEventListener('click', closeFnrhModal);

  if(searchInput) {
    searchInput.addEventListener('input', function() {
      clearBtn.style.display = this.value ? 'block' : 'none';
      const reservasAtivas = allReservas.filter(r => r.status === 'check-in' || r.status === 'pendente');
      const filteredAtivas = reservasAtivas.filter(r => 
        (r.hospedes?.nome_completo||'').toLowerCase().includes(this.value.toLowerCase()) || 
        r.numero_quarto.includes(this.value)
      );
      renderDashboardTables(filteredAtivas);
    });
  }

  let currentReservasFilter = 'all';

  if(searchReservasFull) {
    searchReservasFull.addEventListener('input', function() {
      applyReservasFilter();
    });
  }

  const reservasFilterBtns = document.querySelectorAll('#reservasFilterBtns button');
  if(reservasFilterBtns.length > 0) {
    reservasFilterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        reservasFilterBtns.forEach(b => {
          b.classList.remove('btn-sm-solid');
          b.classList.add('btn-sm-outline');
        });
        this.classList.remove('btn-sm-outline');
        this.classList.add('btn-sm-solid');
        
        currentReservasFilter = this.getAttribute('data-filter');
        applyReservasFilter();
      });
    });
  }

  function applyReservasFilter() {
    let filtered = allReservas;
    if(currentReservasFilter === 'andamento') {
      filtered = allReservas.filter(r => r.status === 'check-in');
    } else if(currentReservasFilter === 'proximas') {
      filtered = allReservas.filter(r => r.status === 'pendente');
    } else if(currentReservasFilter === 'finalizadas') {
      filtered = allReservas.filter(r => r.status === 'check-out' || r.status === 'cancelada');
    }
    
    const term = searchReservasFull?.value.toLowerCase() || '';
    if(term) {
      filtered = filtered.filter(r => 
        (r.hospedes?.nome_completo||'').toLowerCase().includes(term) || 
        r.numero_quarto.includes(term)
      );
    }
    renderReservasTable(filtered, reservasFullTableBody);
  }

  if(searchHospedesFull) {
    searchHospedesFull.addEventListener('input', function() {
      renderHospedesTable(allHospedes.filter(h => 
        (h.nome_completo||'').toLowerCase().includes(this.value.toLowerCase()) || 
        (h.cpf||'').includes(this.value)
      ));
    });
  }

  if(clearBtn) {
    clearBtn.addEventListener('click', function() {
      if(searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
      const reservasAtivas = allReservas.filter(r => r.status === 'check-in' || r.status === 'pendente');
      renderDashboardTables(reservasAtivas);
    });
  }

  const filterBtns = document.querySelectorAll('#paymentFilters button');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentPaymentFilter = this.getAttribute('data-filter');
      renderPagamentos();
    });
  });

  // --- Data & Render ---
  let allHospedes = [];
  let allReservas = [];
  let allProdutos = [];
  let allPagamentos = [];
  let allLogsAcesso = [];
  let allDespesas = [];
  let currentPaymentFilter = 'all';

  let metodoChartInstance = null;
  let statusChartInstance = null;

  async function loadProdutos() {
    if(!supabase) return;
    try {
      const {data, error} = await supabase.from('produtos').select('*').eq('ativo', true).order('nome');
      if(error) throw error;
      allProdutos = data || [];
      
      if(consumoProdutoId) {
        consumoProdutoId.innerHTML = '<option value="">Selecione um produto...</option>' + 
          allProdutos.map(p => `<option value="${p.id}" data-preco="${p.preco_venda}">${p.nome} - R$ ${p.preco_venda.toFixed(2)}</option>`).join('');
      }
    } catch(e) {
      console.error('Erro ao carregar produtos', e);
    }
  }

  function renderReservasTable(reservas, tbody) {
    if(!tbody) return;
    let html = '';
    
    if (reservas.length === 0) {
      html = '<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--text-muted);">Nenhuma reserva.</td></tr>';
    } else {
      html = reservas.map(r => {
        const hData = r.hospedes;
        const nome = hData?.nome_completo || 'Sem Nome';
        let cpf = hData?.cpf || '';
        let telefone = hData?.telefone || '';
        
        const inDate = formatDate(r.data_checkin);
        const outDate = formatDate(r.data_checkout);
        const badgeClass = `badge-${r.status}`;
        
        // Cálculo dinâmico idêntico ao do momento da reserva
        const dInDate = new Date(r.data_checkin + "T00:00:00");
        const dOutDate = new Date(r.data_checkout + "T00:00:00");
        const diffTime = Math.abs(dOutDate - dInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const qValue = parseInt(r.numero_quarto);
        let valorDiaria = 0;
        if (qValue === 1 || qValue === 2) valorDiaria = 60;
        else if (qValue === 3 || qValue === 4) valorDiaria = 90;
        else if (qValue === 5 || qValue === 6) valorDiaria = 100;
        else if (qValue === 7 || qValue === 8) valorDiaria = 160;
        else if (qValue === 9 || qValue === 10) valorDiaria = 140;
        else if (qValue === 11 || qValue === 12) valorDiaria = 210;
        else valorDiaria = 0;
        
        const calcTotal = r.valor_total ? parseFloat(r.valor_total) : (valorDiaria * diffDays);
        const totalStr = formatCurrency(calcTotal);

        let actionBtns = `
          <button class="btn-sm-outline" onclick="openDetailsModal('${r.id}')">Detalhes</button>
        `;
        if (r.status === 'pendente') {
          actionBtns += `<button class="btn-sm-outline" style="color:#555;border-color:#ccc;margin-left:5px;" onclick="openFnrhModal('${nome}','${cpf}','${telefone}','${r.numero_quarto}','${r.data_checkin}','${r.data_checkout}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> FNRH</button>`;
          actionBtns += `<button class="btn-sm-solid" style="margin-left:5px;" onclick="doCheckin('${r.id}')">Check-in</button>`;
          actionBtns += `<button class="btn-sm-outline" style="color:var(--danger);border-color:var(--danger);margin-left:5px;" onclick="doCancel('${r.id}')">Cancelar</button>`;
        } else if (r.status === 'check-in') {
          actionBtns += `<button class="btn-sm-outline" style="color:#555;border-color:#ccc;margin-left:5px;" onclick="openFnrhModal('${nome}','${cpf}','${telefone}','${r.numero_quarto}','${r.data_checkin}','${r.data_checkout}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> FNRH</button>`;
          actionBtns += `<button class="btn-sm-outline" style="color:var(--primary);border-color:var(--primary);margin-left:5px;" onclick="openConsumoModal('${r.id}', '${nome}', '${r.numero_quarto}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg> Consumo</button>`;
          actionBtns += `<button class="btn-sm-solid" style="margin-left:5px;" onclick="doCheckout('${r.id}', '${r.hospede_id}')">Check-out</button>`;
        }

        return `
          <tr>
            <td>
              <div class="user-info">
                <div class="avatar">${getInitials(nome)}</div>
                <div class="user-details">
                  <strong>${nome}</strong>
                  <span>${cpf}</span>
                </div>
              </div>
            </td>
            <td>${r.numero_quarto}</td>
            <td>${inDate}</td>
            <td>${outDate}</td>
            <td><span class="badge ${badgeClass}">${r.status.toUpperCase()}</span></td>
            <td>${totalStr}</td>
            <td class="actions">
              ${actionBtns}
            </td>
          </tr>
        `;
      }).join('');
    }
    tbody.innerHTML = html;
  }

  function renderDashboardTables(reservas) {
    const d = new Date();
    const today = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');

    const checkins = reservas.filter(r => r.status === 'pendente' && r.data_checkin.startsWith(today));
    const checkouts = reservas.filter(r => r.status === 'check-in' && r.data_checkout.startsWith(today));

    renderSmallTable(checkins, document.getElementById('checkinsTodayBody'));
    renderSmallTable(checkouts, document.getElementById('checkoutsTodayBody'));

    const footerIn = document.getElementById('checkinsTodayFooter');
    if(footerIn) footerIn.innerText = `${checkins.length} check-ins aguardados`;
    
    const footerOut = document.getElementById('checkoutsTodayFooter');
    if(footerOut) footerOut.innerText = `${checkouts.length} check-outs programados`;
  }

  function renderSmallTable(reservas, tbody) {
    if(!tbody) return;
    if(reservas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-muted);">Nada programado</td></tr>';
      return;
    }
    tbody.innerHTML = reservas.map(r => {
      const nome = r.hospedes?.nome_completo || 'Sem Nome';
      const qValue = r.numero_quarto;
      
      let actionBtns = `<button class="btn-sm-outline" onclick="openDetailsModal('${r.id}')">Detalhes</button>`;
      if (r.status === 'pendente') {
        actionBtns += `<button class="btn-sm-solid" style="margin-left:5px;" onclick="doCheckin('${r.id}')">Check-in</button>`;
        actionBtns += `<button class="btn-sm-outline" style="color:var(--danger);border-color:var(--danger);margin-left:5px;" onclick="doCancel('${r.id}')">Cancelar</button>`;
      } else if (r.status === 'check-in') {
        actionBtns += `<button class="btn-sm-solid" style="margin-left:5px;" onclick="doCheckout('${r.id}', '${r.hospede_id}')">Check-out</button>`;
      }
      return `<tr>
        <td>${nome}</td>
        <td><strong>${qValue}</strong></td>
        <td class="actions">${actionBtns}</td>
      </tr>`;
    }).join('');
  }

  function renderMapaQuartos(reservas) {
    const grid = document.getElementById('roomMapGrid');
    if(!grid) return;

    let html = '';
    const totalQuartos = 12;
    const roomStart = 1;

    for(let i = 0; i < totalQuartos; i++) {
      const roomNum = String(roomStart + i);
      
      // Look for an active check-in
      const reserva = reservas.find(r => r.numero_quarto === roomNum && r.status === 'check-in');
      
      if(reserva) {
        const nome = reserva.hospedes?.nome_completo || 'Sem Nome';
        html += `
          <div class="room-card occupied">
            <h3 class="room-number">${roomNum}</h3>
            <span class="room-status-badge">Ocupado</span>
            <div class="room-guest">${nome}</div>
          </div>
        `;
      } else {
        html += `
          <div class="room-card free">
            <h3 class="room-number">${roomNum}</h3>
            <span class="room-status-badge">Livre</span>
            <div class="room-guest">-</div>
          </div>
        `;
      }
    }
    grid.innerHTML = html;
  }

  function renderPagamentos() {
    const tbody = document.getElementById('paymentsTableBody');
    if(!tbody) return;

    let filtered = allPagamentos;
    if(currentPaymentFilter === 'pendentes') {
      filtered = allPagamentos.filter(p => p.metodo_pagamento === 'pendente' || p.status === 'pendente');
    } else if(currentPaymentFilter === 'recebidos') {
      filtered = allPagamentos.filter(p => p.metodo_pagamento !== 'pendente' && p.status !== 'pendente');
    }

    if(filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--text-muted);">Nenhum pagamento encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const dataStr = new Date(p.data_pagamento).toLocaleString('pt-BR');
      const nome = p.hospedes?.nome_completo || 'Desconhecido';
      const valor = `R$ ${Number(p.valor).toFixed(2)}`;
      const isPendente = p.metodo_pagamento === 'pendente' || p.status === 'pendente';
      const statusBadge = isPendente ? '<span class="badge badge-pendente">PENDENTE</span>' : '<span class="badge badge-check-out">PAGO</span>';
      
      let methodStr = isPendente ? '-' : (p.metodo_pagamento || 'N/A').toUpperCase();
      let actionBtn = isPendente ? `<button class="btn-sm-solid" onclick="openPayModal('${p.hospede_id}', '${nome}', '')">Receber</button>` : '';

      return `
        <tr>
          <td>${dataStr}</td>
          <td>${nome}</td>
          <td>${statusBadge}</td>
          <td>${methodStr}</td>
          <td style="display:flex; justify-content:space-between; align-items:center;">
            <span>${valor}</span>
            ${actionBtn}
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateDashboard() {
    const activeGuests = allReservas.filter(r => r.status === 'check-in').length;
    activeGuestsEl.textContent = activeGuests;

    let totalPaid = 0;
    let totalPending = 0;
    let pendingCount = 0;
    let totalDespesas = 0;

    allDespesas.forEach(d => {
      // assumindo que as despesas também têm um valor a descontar
      totalDespesas += Number(d.valor);
    });

    allPagamentos.forEach(p => {
      if (p.metodo_pagamento === 'pendente' || p.status === 'pendente') {
        totalPending += Number(p.valor);
        pendingCount++;
      } else {
        totalPaid += Number(p.valor);
      }
    });

    totalRevenueEl.textContent = `R$ ${totalPaid.toFixed(2)}`;
    pendingRevenueEl.textContent = `R$ ${totalPending.toFixed(2)}`;
    if (document.getElementById('pendingCount')) {
      document.getElementById('pendingCount').textContent = pendingCount;
    }
    
    // Calcula Lucro/Prejuízo
    const profitRevenueEl = document.getElementById('profitRevenue');
    const profitSubtitleEl = document.getElementById('profitSubtitle');
    if (profitRevenueEl) {
      const lucro = totalPaid - totalDespesas;
      profitRevenueEl.textContent = `R$ ${lucro.toFixed(2)}`;
      
      if (lucro >= 0) {
        profitSubtitleEl.textContent = 'Lucro Operacional';
        profitSubtitleEl.style.color = 'var(--success)';
      } else {
        profitSubtitleEl.textContent = 'Prejuízo Operacional';
        profitSubtitleEl.style.color = 'var(--danger)';
      }
    }

    // DRE Simplificado
    const dreReceitaTotal = document.getElementById('dreReceitaTotal');
    const dreReceitaRecebida = document.getElementById('dreReceitaRecebida');
    const dreInadimplencia = document.getElementById('dreInadimplencia');
    const dreTicketMedio = document.getElementById('dreTicketMedio');

    const receitaTotal = totalPaid + totalPending;
    const qtdReservas = allReservas.length;
    const ticketMedio = qtdReservas > 0 ? receitaTotal / qtdReservas : 0;

    if(dreReceitaTotal) dreReceitaTotal.textContent = formatCurrency(receitaTotal);
    if(dreReceitaRecebida) dreReceitaRecebida.textContent = formatCurrency(totalPaid);
    if(dreInadimplencia) dreInadimplencia.textContent = formatCurrency(totalPending);
    if(dreTicketMedio) dreTicketMedio.textContent = formatCurrency(ticketMedio);

    renderCharts(totalPaid, totalPending);
  }

  function renderCharts(totalPaid, totalPending) {
    if(typeof Chart === 'undefined') return;

    // Chart 1: Status
    const ctxStatus = document.getElementById('statusPagamentoChart');
    if(ctxStatus) {
      if(statusChartInstance) statusChartInstance.destroy();
      statusChartInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Pago', 'Pendente'],
          datasets: [{
            data: [totalPaid, totalPending],
            backgroundColor: ['#27ae60', '#f39c12'],
            borderWidth: 0
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#fff' } }
          }
        }
      });
    }

    // Chart 2: Method
    const ctxMetodo = document.getElementById('metodoPagamentoChart');
    if(ctxMetodo) {
      const methodTotals = {};
      allPagamentos.forEach(p => {
        if (p.metodo_pagamento !== 'pendente' && p.status !== 'pendente') {
          const m = p.metodo_pagamento || 'Outro';
          methodTotals[m] = (methodTotals[m] || 0) + Number(p.valor);
        }
      });
      const labels = Object.keys(methodTotals).map(s => s.toUpperCase());
      const data = Object.values(methodTotals);

      if(metodoChartInstance) metodoChartInstance.destroy();
      metodoChartInstance = new Chart(ctxMetodo, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Faturamento',
            data: data,
            backgroundColor: '#00d2ff',
            borderRadius: 4
          }]
        },
        options: {
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { ticks: { color: '#ccc' }, grid: { color: '#333' } },
            x: { ticks: { color: '#ccc' }, grid: { display: false } }
          }
        }
      });
    }
  }

  function renderHospedesTable(hospedes, tbody) {
    if(!tbody) return;
    let html = '';
    
    if (hospedes.length === 0) {
      html = '<tr><td colspan="4" style="text-align:center;padding:3rem;color:var(--text-muted);">Nenhum cliente cadastrado.</td></tr>';
    } else {
      html = hospedes.map(h => {
        return `
          <tr>
            <td>
              <div class="user-info">
                <div class="avatar">${getInitials(h.nome_completo)}</div>
                <div class="user-details">
                  <strong>${h.nome_completo}</strong>
                </div>
              </div>
            </td>
            <td>${h.cpf}</td>
            <td>${h.telefone || '-'}</td>
            <td>${formatDate(h.criado_em.split('T')[0])}</td>
          </tr>
        `;
      }).join('');
    }

    tbody.innerHTML = html;
  }

  function renderPendencias(pagamentos, hospedes) {
    const pendentes = pagamentos.filter(p => p.metodo_pagamento === 'pendente');
    const badge = document.getElementById('pendencyBadge');
    if(!badge) return;
    
    if (pendentes.length > 0) {
      badge.textContent = pendentes.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  async function fetchActivities(reservas, pagamentos) {
    if (!supabase || !activityList) return;
    try {
      let acts = [];
      acts.push(...reservas.map(r => ({ type: 'guest', text: 'Nova reserva', sub: `${r.hospedes?.nome_completo} - Qto ${r.numero_quarto}`, time: r.criado_em })));
      acts.push(...pagamentos.map(p => {
        const h = allHospedes.find(x => x.id === p.hospede_id);
        const name = h ? h.nome_completo : 'Hóspede';
        const txt = p.metodo_pagamento === 'pendente' ? 'Dívida gerada' : 'Pagamento recebido';
        return { type: 'pay', text: txt, sub: name, time: p.data_pagamento };
      }));

      acts.sort((a, b) => new Date(b.time) - new Date(a.time));
      acts = acts.slice(0, 5);

      activityList.innerHTML = '';
      if(acts.length === 0) {
        activityList.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;text-align:center;margin-top:1rem;">Nenhuma atividade recente.</div>';
        return;
      }

      acts.forEach(a => {
        const icon = a.type === 'pay' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
          <div class="act-icon ${a.type}">${icon}</div>
          <div class="act-details">
            <strong>${a.text}</strong>
            <span>${a.sub}</span>
          </div>
          <div class="act-time">${timeAgo(a.time)}</div>
        `;
        activityList.appendChild(div);
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchMetrics(reservas, pagamentos) {
    const quartosOcupados = new Set(reservas.filter(r => r.status === 'check-in').map(r => r.numero_quarto));
    if(activeGuestsEl) activeGuestsEl.innerText = quartosOcupados.size;
    
    const pendentes = pagamentos.filter(p => p.status === 'pendente' || p.metodo_pagamento === 'pendente');
    if(pendingCountEl) pendingCountEl.innerText = pendentes.length;
    
    const valorPendente = pendentes.reduce((acc, p) => acc + p.valor, 0);
    if(pendingRevenueEl) pendingRevenueEl.innerText = formatCurrency(valorPendente);

    const pagos = pagamentos.filter(p => p.status === 'pago');
    const valorPago = pagos.reduce((acc, p) => acc + p.valor, 0);
    if(totalRevenueEl) totalRevenueEl.innerText = formatCurrency(valorPago);
  }

  async function fetchAll() {
    if (!supabase) return;
    
    try {
      const { data: hospData, error: errH } = await supabase.from('hospedes').select('*').order('criado_em', { ascending: false });
      if (errH) throw errH;
      allHospedes = hospData || [];

      const { data: resData, error: errR } = await supabase.from('reservas').select('*, hospedes(*)').order('criado_em', { ascending: false });
      if (errR) throw errR;
      allReservas = resData || [];

      const { data: payData, error: payError } = await supabase
        .from('pagamentos')
        .select(`
          *,
          hospedes ( nome_completo, cpf, telefone )
        `)
        .order('data_pagamento', { ascending: false });
      
      if(payError) throw payError;
      allPagamentos = payData || [];

      // Buscar Despesas
      const { data: despData, error: despError } = await supabase
        .from('despesas')
        .select('*')
        .order('data_vencimento', { ascending: false });
      
      if(despError) throw despError;
      allDespesas = despData || [];

      // Render
      const reservasAtivas = allReservas.filter(r => r.status === 'check-in' || r.status === 'pendente');
      renderDashboardTables(reservasAtivas);
      applyReservasFilter();
      renderHospedesTable(allHospedes, document.getElementById('guestsFullTableBody'));
      renderMapaQuartos(allReservas);
      renderPagamentos();
      updateDashboard();
      
      renderPendencias(allPagamentos, allHospedes);
      fetchActivities(allReservas, allPagamentos);
      fetchLogsAcesso();

    } catch (e) {
      console.error(e);
      showToast('Erro ao carregar dados', 'error');
    }
  }

  // --- Logs de Acesso ---
  async function fetchLogsAcesso() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('logs_acesso').select('*').order('data_hora', { ascending: false }).limit(20);
      if (error) throw error;
      allLogsAcesso = data || [];
      renderLogsAcesso(allLogsAcesso);
    } catch (e) {
      console.error('Erro ao buscar logs:', e);
    }
  }

  function renderLogsAcesso(logs) {
    if (!logsAcessoTableBody) return;
    logsAcessoTableBody.innerHTML = '';
    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.style.borderTop = '1px solid var(--border-color)';
      
      const badgeStyle = log.status === 'Sucesso' 
        ? 'color: #15803d; background-color: #dcfce7;' 
        : 'color: #b91c1c; background-color: #fee2e2;';

      const dataStr = log.data_hora ? new Date(log.data_hora).toLocaleString('pt-BR') : '';

      tr.innerHTML = `
        <td style="padding: 12px;"><strong>${log.usuario_email}</strong></td>
        <td style="padding: 12px;"><span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; ${badgeStyle}">${log.status}</span></td>
        <td style="padding: 12px; color: var(--text-muted); font-size: 14px;">${log.ip_user_agent || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted); font-size: 14px;">${dataStr}</td>
      `;
      logsAcessoTableBody.appendChild(tr);
    });
  }

  // --- Submits ---
  addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!supabase) return showToast('Modo offline', 'warning');
    
    setLoading('add', true);
    try {
      const payloadNome = document.getElementById('nome').value.trim();
      const payloadCpf = document.getElementById('cpf').value.trim();
      const payloadTel = document.getElementById('telefone').value.trim();
      const payloadQuarto = document.getElementById('quarto').value;
      const payloadCheckin = document.getElementById('checkin').value;
      const payloadCheckout = document.getElementById('checkout').value;

      if (new Date(payloadCheckout) <= new Date(payloadCheckin)) {
        throw new Error('Check-out deve ser maior que Check-in');
      }

      let hospede_id = null;
      let existHosp = null;

      if (payloadCpf) {
        const { data, error: errHosp } = await supabase
          .from('hospedes')
          .select('id')
          .eq('cpf', payloadCpf)
          .maybeSingle();
        if (errHosp) throw errHosp;
        existHosp = data;
      }

      if (existHosp) {
        hospede_id = existHosp.id;
        await supabase.from('hospedes').update({ nome_completo: payloadNome, telefone: payloadTel }).eq('id', hospede_id);
      } else {
        const insertData = { nome_completo: payloadNome, telefone: payloadTel };
        if (payloadCpf) insertData.cpf = payloadCpf; // Only add if present

        const { data: newHosp, error: errNew } = await supabase
          .from('hospedes')
          .insert([insertData])
          .select('id')
          .single();
        if(errNew) throw errNew;
        hospede_id = newHosp.id;
      }

      const payloadReserva = {
        hospede_id: hospede_id,
        numero_quarto: payloadQuarto,
        data_checkin: payloadCheckin,
        data_checkout: payloadCheckout,
        status: 'pendente'
      };

      const dInDate = new Date(payloadCheckin + "T00:00:00");
      const dOutDate = new Date(payloadCheckout + "T00:00:00");
      const diffTime = Math.abs(dOutDate - dInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const climatizacaoSelect = document.getElementById('climatizacao');
      const climatizacao = climatizacaoSelect ? climatizacaoSelect.value : 'ventilador';
      
      const payloadHospedesQtd = parseInt(document.getElementById('hospedesQuantidade').value) || 1;
      const valorDiariaBase = (climatizacao === 'ar') ? 90 : 70;
      const valorDiaria = valorDiariaBase * payloadHospedesQtd;
      const totalReserva = valorDiaria * diffDays;
      
      payloadReserva.valor_total = totalReserva;

      const { error: errRes } = await supabase.from('reservas').insert([payloadReserva]);
      if (errRes) {
        if(errRes.message.includes('Overbooking')) throw new Error('Quarto indisponível neste período.');
        throw errRes;
      }

      const { error: errPay } = await supabase.from('pagamentos').insert([{
        hospede_id: hospede_id,
        valor: totalReserva,
        metodo_pagamento: 'pendente',
        status: 'pendente'
      }]);
      if (errPay) throw errPay;

      showToast('Reserva criada com sucesso!');
      closeAddModal();
      fetchAll();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading('add', false);
    }
  });

  if(payForm) {
    payForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!supabase) return showToast('Modo offline', 'warning');
      
      setLoading('pay', true);
      try {
        const id = payHospedeId.value;
        const met = payMetodo.value;

        const { error: err1 } = await supabase
          .from('pagamentos')
          .update({ metodo_pagamento: met, status: 'pago', data_pagamento: new Date().toISOString() })
          .eq('hospede_id', id)
          .eq('metodo_pagamento', 'pendente');
        
        if (err1) throw err1;

        showToast('Pagamento registrado com sucesso!');
        closePayModal();
        fetchAll();
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        setLoading('pay', false);
      }
    });
  }

  if(consumoForm) {
    consumoForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!supabase) return showToast('Modo offline', 'warning');
      
      setLoading('consumo', true);
      try {
        const resId = consumoReservaId.value;
        const prodId = consumoProdutoId.value;
        const qtd = parseInt(consumoQuantidade.value, 10);
        
        const optionSelected = consumoProdutoId.options[consumoProdutoId.selectedIndex];
        const preco = parseFloat(optionSelected.getAttribute('data-preco'));
        const total = preco * qtd;

        const { error: err } = await supabase.from('consumos').insert([{
          reserva_id: resId,
          produto_id: prodId,
          quantidade: qtd,
          valor_unitario: preco,
          valor_total_item: total
        }]);
        
        if (err) throw err;

        showToast(`Consumo lançado com sucesso! Total: R$ ${total.toFixed(2)}`);
        closeConsumoModal();
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        setLoading('consumo', false);
      }
    });
  }

  // Payment Filters
  const paymentFilterBtns = document.querySelectorAll('#paymentFilters button');
  paymentFilterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      paymentFilterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentPaymentFilter = e.target.getAttribute('data-filter');
      renderPagamentos();
    });
  });

  // Start
  loadProdutos();
  fetchAll();

  // --- LOGOUT LOGIC ---
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (supabase) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      }
    });
  }
});

// Mobile Sidebar Toggle
window.toggleSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }
};
