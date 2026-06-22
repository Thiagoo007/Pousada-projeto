document.addEventListener('DOMContentLoaded', () => {
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
      // console.log('[Login] Supabase OK.');
    } catch (e) {
      console.error('[Login] Erro ao inicializar Supabase:', e);
    }
  }

  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  async function getPublicIP() {
    try {
      // Trocando para o jsonip.com ou seeip.org que costumam resolver melhor a ponta da conexão
      const res = await fetch('https://api.seeip.org/jsonip');
      const data = await res.json();
      return data.ip;
    } catch (e) {
      return 'IP Desconhecido';
    }
  }

  // Função de gravação de auditoria isolada para não quebrar o fluxo principal
  async function registrarLog(email, status) {
    try {
      const ip = await getPublicIP();
      const { error } = await supabase.from('logs_acesso').insert([{
        usuario_email: email,
        status: status,
        ip_user_agent: `IP: ${ip} | UserAgent: ${navigator.userAgent}`
      }]);
      if (error) console.error(`[Auditoria] Erro ao registrar ${status}:`, error);
    } catch (e) {
      console.error(`[Auditoria] Exceção ao registrar ${status}:`, e);
    }
  }

  // Check if already logged in
  async function checkSession() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  }
  checkSession(); // <- RESTAURADO (Funcionamento normal)

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabase) return;

    loginBtn.disabled = true;
    loginBtn.textContent = 'Autenticando...';
    loginError.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Grava falha sem bloquear a exibição do erro
        await registrarLog(email, 'Falha');
        throw error;
      }

      // Grava sucesso antes do redirecionamento
      await registrarLog(email, 'Sucesso');
      window.location.href = 'dashboard.html';
    } catch (err) {
      loginError.textContent = err.message || 'Credenciais inválidas.';
      loginError.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    }
  });
});
