
  window.addEventListener('error', function(e) {
    console.error('JS Error:', e.message, 'linha', e.lineno);
  });

  function showPage(id, linkEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');
    window.scrollTo(0, 0);
    const hideNav = id === 'login' || id === 'admin';
    document.querySelector('nav').style.display = hideNav ? 'none' : '';
    const bar = document.getElementById('announcement-bar');
    if (bar) bar.style.display = hideNav ? 'none' : '';
    const wapp = document.querySelector('.whatsapp-float');
    if (wapp) wapp.style.display = hideNav ? 'none' : '';
    return false;
  }

  function filterProducts(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cards = document.querySelectorAll('#products-grid .product-card');
    cards.forEach(card => {
      const cats = card.dataset.cat || '';
      card.style.display = (cat === 'todos' || cats.includes(cat)) ? '' : 'none';
    });
  }

  // â”€â”€ CART â”€â”€
  let cart = [];

  function addToCart(btn) {
    const card = btn.closest('.product-card');
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const priceFmt = card.dataset.priceFmt;
    const img = card.dataset.img;
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; } else { cart.push({ name, price, priceFmt, img, qty: 1 }); }
    renderCart();
    updateCartBadge();
    showToast('Adicionado ao pedido');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Adicionado';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1200);
  }

  function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
    updateCartBadge();
  }

  function renderCart() {
    const body = document.getElementById('cart-body');
    const footer = document.getElementById('cart-footer');
    const countEl = document.getElementById('cart-item-count');
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = totalQty === 1 ? '1 item' : `${totalQty} itens`;

    if (cart.length === 0) {
      body.innerHTML = `<div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Seu pedido estÃ¡ vazio</p>
        <small>Explore o cardÃ¡pio e adicione itens</small>
      </div>`;
      footer.style.display = 'none';
      return;
    }
    footer.style.display = '';
    body.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.priceFmt}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty(${i},-1)">âˆ’</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${i},1)">+</button>
        </div>
      </div>`).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = subtotal >= 80 ? 0 : 8.90;
    const total = subtotal + delivery;
    const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
    document.getElementById('cart-subtotal').textContent = fmt(subtotal);
    document.getElementById('cart-delivery').textContent = delivery === 0 ? 'GrÃ¡tis' : fmt(delivery);
    document.getElementById('cart-total').textContent = fmt(total);
    const freeMsg = document.getElementById('cart-free-msg');
    if (subtotal < 80) {
      const diff = fmt(80 - subtotal);
      freeMsg.textContent = `Faltam ${diff} para frete grÃ¡tis`;
      freeMsg.style.display = '';
    } else {
      freeMsg.textContent = 'âœ“ Frete grÃ¡tis aplicado';
      freeMsg.style.color = 'var(--green)';
    }
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const total = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = total > 9 ? '9+' : total;
    badge.classList.toggle('visible', total > 0);
  }

  function openCart() {
    renderCart();
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-drawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  // â”€â”€ TOAST â”€â”€
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${msg}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // â”€â”€ PRODUCT MODAL â”€â”€
  function openProductModal(card) {
    const badges = (card.dataset.badges || '').split(',').filter(Boolean);
    const rating = card.dataset.rating || '4.8';
    const reviews = card.dataset.reviews || '100';
    document.getElementById('product-modal-img').src = card.dataset.img;
    document.getElementById('product-modal-img').alt = card.dataset.name;
    document.getElementById('product-modal-cat').textContent = (card.dataset.cat || '').split(' ')[0].toUpperCase();
    document.getElementById('product-modal-name').textContent = card.dataset.name;
    document.getElementById('product-modal-stars-txt').textContent = 'â˜…'.repeat(Math.round(parseFloat(rating)));
    document.getElementById('product-modal-rating-count').textContent = `${rating} (${reviews} avaliaÃ§Ãµes)`;
    document.getElementById('product-modal-desc').textContent = card.dataset.desc;
    document.getElementById('product-modal-badges').innerHTML = badges.map(b => `<span class="badge" style="background:var(--cream-dark);border:1px solid var(--border)">${b}</span>`).join('');
    // macros
    document.getElementById('modal-macro-peso').textContent = card.dataset.peso || 'â€”';
    document.getElementById('modal-macro-cals').textContent = card.dataset.cals ? card.dataset.cals + ' kcal' : 'â€”';
    document.getElementById('modal-macro-prot').textContent = card.dataset.prot || 'â€”';
    document.getElementById('modal-macro-carb').textContent = card.dataset.carb || 'â€”';
    document.getElementById('modal-macro-gord').textContent = card.dataset.gord || 'â€”';
    // preparo
    const preparo = card.dataset.preparo || '';
    document.getElementById('modal-preparo-text').textContent = preparo;
    document.getElementById('product-modal-preparo').style.display = preparo ? '' : 'none';
    document.getElementById('product-modal-price').textContent = card.dataset.priceFmt;
    document.getElementById('product-modal-add-btn').dataset.cardJson = JSON.stringify({
      name: card.dataset.name, price: card.dataset.price, priceFmt: card.dataset.priceFmt, img: card.dataset.img
    });
    document.getElementById('product-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    document.getElementById('product-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function addToCartFromModal() {
    const data = JSON.parse(document.getElementById('product-modal-add-btn').dataset.cardJson);
    const existing = cart.find(i => i.name === data.name);
    if (existing) { existing.qty++; } else { cart.push({ ...data, price: parseFloat(data.price), qty: 1 }); }
    renderCart();
    updateCartBadge();
    showToast('Adicionado ao pedido');
    closeProductModal();
  }

  document.getElementById('product-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
  });

  // â”€â”€ CHECKOUT â”€â”€
  let checkoutStep = 1;

  function openCheckout() {
    closeCart();
    checkoutStep = 1;
    renderCheckoutStep();
    document.getElementById('checkout-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    document.getElementById('checkout-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('checkout-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeCheckout();
  });

  function updateStepDots() {
    [1,2,3].forEach(n => {
      const dot = document.getElementById('dot-' + n);
      dot.classList.toggle('active', n === checkoutStep);
      dot.classList.toggle('done', n < checkoutStep);
    });
  }

  function renderCheckoutStep() {
    updateStepDots();
    const body = document.getElementById('checkout-body-content');
    const title = document.getElementById('checkout-step-title');
    if (checkoutStep === 1) {
      title.textContent = 'Dados de entrega';
      body.innerHTML = `
        <div class="form-row">
          <div class="form-group"><label>NOME COMPLETO</label><input type="text" placeholder="Seu nome"></div>
          <div class="form-group"><label>TELEFONE</label><input type="tel" placeholder="(11) 99999-0000"></div>
        </div>
        <div class="form-group"><label>ENDEREÃ‡O</label><input type="text" placeholder="Rua e nÃºmero"></div>
        <div class="form-row">
          <div class="form-group"><label>BAIRRO</label><input type="text" placeholder="Bairro"></div>
          <div class="form-group"><label>CIDADE</label><input type="text" placeholder="Cidade"></div>
        </div>
        <div class="form-group"><label>COMPLEMENTO / REFERÃŠNCIA</label><input type="text" placeholder="Apartamento, ponto de referÃªncia..."></div>
        <div class="checkout-actions">
          <button class="btn-outline" onclick="closeCheckout()">Cancelar</button>
          <button class="btn-primary" onclick="checkoutStep=2;renderCheckoutStep()" style="margin-top:0">Continuar â†’</button>
        </div>`;
    } else if (checkoutStep === 2) {
      title.textContent = 'Forma de pagamento';
      body.innerHTML = `
        <div class="payment-options">
          <div class="payment-option selected" onclick="selectPayment(this)">
            <div class="payment-option-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><path d="M21 16h-3v5"/><path d="M16 21h5"/><path d="M16 16h2"/></svg></div>
            <div class="payment-option-label"><strong>PIX</strong><small>AprovaÃ§Ã£o imediata</small></div>
          </div>
          <div class="payment-option" onclick="selectPayment(this)">
            <div class="payment-option-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
            <div class="payment-option-label"><strong>CartÃ£o de crÃ©dito</strong><small>AtÃ© 3x sem juros</small></div>
          </div>
          <div class="payment-option" onclick="selectPayment(this)">
            <div class="payment-option-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="6" y1="7" x2="6" y2="17"/><line x1="10" y1="7" x2="10" y2="17"/><line x1="14" y1="7" x2="14" y2="17"/><line x1="18" y1="7" x2="18" y2="17"/></svg></div>
            <div class="payment-option-label"><strong>Boleto bancÃ¡rio</strong><small>Vencimento em 1 dia Ãºtil</small></div>
          </div>
        </div>
        <div class="checkout-actions">
          <button class="btn-outline" onclick="checkoutStep=1;renderCheckoutStep()">â† Voltar</button>
          <button class="btn-primary" onclick="checkoutStep=3;renderCheckoutStep()" style="margin-top:0">Confirmar pedido</button>
        </div>`;
    } else {
      title.textContent = 'Pedido confirmado';
      const num = Math.floor(10000 + Math.random() * 90000);
      body.innerHTML = `
        <div class="checkout-confirm">
          <div class="confirm-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>Pedido recebido!</h3>
          <p>Obrigada por escolher a Bendita VitalitÃ©.<br>Seu pedido estÃ¡ sendo preparado com carinho.</p>
          <div class="order-number">PEDIDO #${num}</div>
          <div class="estimated-time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Tempo estimado: 30â€“45 minutos
          </div>
          <div class="checkout-actions" style="justify-content:center;margin-top:22px">
            <button class="btn-primary" onclick="closeCheckout()" style="margin-top:0">Continuar comprando</button>
          </div>
        </div>`;
      cart = [];
      renderCart();
      updateCartBadge();
    }
  }

  function selectPayment(el) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  }

  renderCart();

  // â”€â”€ LOGIN â”€â”€
  function openLogin() { showPage('login'); }

  // â”€â”€ MOBILE NAV â”€â”€
  function toggleMobileNav() {
    const links = document.getElementById('nav-links');
    const btn   = document.getElementById('nav-hamburger');
    links.classList.toggle('open');
    btn.classList.toggle('open');
  }
  function closeMobileNav() {
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('nav-hamburger').classList.remove('open');
  }

  function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const erro = document.getElementById('login-error');
    if (!email || !senha) {
      erro.textContent = 'Preencha e-mail e senha para continuar.';
      erro.style.display = 'block';
      return;
    }
    erro.style.display = 'none';
    document.getElementById('sb-email').textContent = email;
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
    try {
      showPage('admin');
      showAdminSection('dashboard');
    } catch(e) {
      erro.textContent = 'Erro ao carregar painel: ' + e.message;
      erro.style.display = 'block';
    }
  }

  function doLogout() {
    adminSelectedId = null;
    showPage('inicio', document.querySelectorAll('.nav-links a')[0]);
  }

  // â”€â”€ ADMIN NAVIGATION â”€â”€
  function showAdminSection(sec) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById('admin-section-' + sec).style.display = '';
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    document.getElementById('slink-' + sec).classList.add('active');
    if (sec === 'dashboard') renderAdminDashboard();
    if (sec === 'pedidos')   { renderAdmin(); }
    if (sec === 'produtos')  renderAdminProdutos();
  }

  // â”€â”€ DASHBOARD â”€â”€
  function renderAdminDashboard() {
    const todayDow = new Date().getDay();
    const total    = ORDERS.length;
    const faturamento = ORDERS.filter(o => o.status !== 'cancelado').reduce((s, o) => s + orderTotal(o), 0);
    const pendentes   = ORDERS.filter(o => ['novo','preparo'].includes(o.status)).length;
    const allOrders   = WEEKLY_DATA.reduce((s, d) => s + d.orders, 0);
    const allRevenue  = WEEKLY_DATA.reduce((s, d) => s + d.revenue, 0);
    const ticket      = allRevenue / allOrders;
    const maxRev      = Math.max(...WEEKLY_DATA.map(d => d.revenue));

    const chartCols = WEEKLY_DATA.map(d => {
      const pct = Math.round((d.revenue / maxRev) * 100);
      const isToday = d.dow === todayDow;
      return `
        <div class="adm-chart-col">
          <div class="adm-chart-bar${isToday ? ' today' : ''}" style="height:${pct}%"></div>
          <span class="adm-chart-day">${d.label}</span>
        </div>`;
    }).join('');

    const recentRows = ORDERS.slice(0, 5).map(o => {
      const meta = STATUS_META[o.status];
      return `
        <div class="adm-recent-row">
          <span class="adm-recent-num">#${o.id}</span>
          <div style="flex:1">
            <div class="adm-recent-cliente">${o.cliente}</div>
          </div>
          <span class="status-badge ${meta.badge}" style="margin-right:10px">${meta.label}</span>
          <span class="adm-recent-val">${fmtBRL(orderTotal(o))}</span>
        </div>`;
    }).join('') || `<div class="adm-empty">Nenhum pedido ainda.</div>`;

    document.getElementById('admin-section-dashboard').innerHTML = `
      <div class="adm-title">Dashboard</div>
      <p class="adm-sub">VisÃ£o geral da operaÃ§Ã£o</p>

      <div class="adm-kpis">
        <div class="adm-kpi">
          <div><div class="adm-kpi-label">PEDIDOS HOJE</div><div class="adm-kpi-val">${total}</div></div>
          <div class="adm-kpi-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        </div>
        <div class="adm-kpi">
          <div><div class="adm-kpi-label">FATURAMENTO HOJE</div><div class="adm-kpi-val">${fmtBRL(faturamento)}</div></div>
          <div class="adm-kpi-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
        </div>
        <div class="adm-kpi">
          <div><div class="adm-kpi-label">PENDENTES</div><div class="adm-kpi-val">${pendentes}</div></div>
          <div class="adm-kpi-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        </div>
        <div class="adm-kpi">
          <div><div class="adm-kpi-label">TICKET MÃ‰DIO</div><div class="adm-kpi-val">${fmtBRL(ticket)}</div></div>
          <div class="adm-kpi-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
        </div>
      </div>

      <div class="adm-grid2">
        <div class="adm-card">
          <div class="adm-card-hd">
            <span class="adm-card-title">Faturamento (Ãºltimos 7 dias)</span>
          </div>
          <div class="adm-chart">${chartCols}</div>
          <div class="admin-insights" id="metricas-insights" style="padding:0;margin-top:20px;border-top:1px solid var(--border);padding-top:20px"></div>
        </div>
        <div class="adm-card">
          <div class="adm-card-hd">
            <span class="adm-card-title">Pedidos recentes</span>
            <button class="adm-card-link" onclick="showAdminSection('pedidos')">Ver todos</button>
          </div>
          ${recentRows}
        </div>
      </div>
    `;
    renderAdminInsights();
  }

  function renderAdmin() {
    renderAdminStats();
    renderAdminToolbar();
    renderAdminList();
    if (adminSelectedId) renderAdminDetail();
  }

  // â”€â”€ PRODUTOS â”€â”€
  let PRODUCTS = [
    { id:1, name:'Salada CÃ©sar de Frango',  slug:'salada-cesar-frango',  cat:'Saladas',          desc:'Frango grelhado, alface romana, croutons artesanais e molho cÃ©sar caseiro.', price:38.90, stock:25, badge:'',          imgUrl:'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=80&q=70&fit=crop', tags:'Sem glÃºten',       ingredients:'Frango, alface, croutons, parmesÃ£o, limÃ£o.',    cals:320, prot:28, carb:18, gord:12, peso:'320g',          preparo:'Frango grelhado na chapa sem adiÃ§Ã£o de gordura, temperado apenas com ervas frescas e limÃ£o. Molho cÃ©sar feito com iogurte natural em vez de maionese â€” 60% menos gordura saturada. Croutons artesanais assados no forno, sem fritura.', ativo:true,  destaque:false },
    { id:2, name:'Poke Bowl de SalmÃ£o',     slug:'poke-bowl-salmao',     cat:'Bowls',             desc:'SalmÃ£o fresco, arroz japonÃªs temperado, manga, edamame e molho shoyu.',        price:42.90, stock:18, badge:'MAIS PEDIDO', imgUrl:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=80&q=70&fit=crop', tags:'',                 ingredients:'SalmÃ£o, arroz, manga, edamame, shoyu.',         cals:480, prot:32, carb:45, gord:14, peso:'450g',          preparo:'SalmÃ£o marinado a frio com shoyu low-sodium e limÃ£o siciliano â€” sem cozimento, preserva 100% dos Ã´mega-3. Arroz japonÃªs cozido sem manteiga ou Ã³leo. Vegetais mantidos crus para conservar vitaminas e enzimas digestivas.', ativo:true,  destaque:true  },
    { id:3, name:'Bowl AÃ§aÃ­ Funcional',     slug:'bowl-acai-funcional',  cat:'Bowls',             desc:'AÃ§aÃ­ puro, banana, granola caseira, mel silvestre e frutas frescas.',           price:28.90, stock:30, badge:'',          imgUrl:'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=80&q=70&fit=crop', tags:'Vegano',           ingredients:'AÃ§aÃ­, banana, granola, mel, frutas.',           cals:380, prot:8,  carb:62, gord:10, peso:'380g',          preparo:'AÃ§aÃ­ puro sem xarope ou aÃ§Ãºcar refinado. Granola artesanal assada no forno com mel silvestre â€” zero fritura. Frutas selecionadas in natura no dia do preparo, sem calda ou conservante.', ativo:true,  destaque:false },
    { id:4, name:'Detox Verde',             slug:'detox-verde',          cat:'Sucos & Smoothies', desc:'Couve orgÃ¢nica, maÃ§Ã£ verde, gengibre fresco e hortelÃ£. Prensado a frio.',        price:18.90, stock:40, badge:'',          imgUrl:'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=80&q=70&fit=crop', tags:'Vegano, Sem glÃºten', ingredients:'Couve, maÃ§Ã£ verde, gengibre, hortelÃ£, limÃ£o.',  cals:95,  prot:2,  carb:22, gord:0,  peso:'300ml',         preparo:'Prensado a frio (cold press) â€” processo que preserva 100% das enzimas, vitaminas e antioxidantes. Sem pasteurizaÃ§Ã£o, sem conservantes, sem aÃ§Ãºcar adicionado. Produzido no dia da entrega.', ativo:true,  destaque:false },
    { id:5, name:'Salada MediterrÃ¢nea',     slug:'salada-mediterranea',  cat:'Saladas',          desc:'Mix de folhas, tomate cereja, pepino, azeitonas e feta.',                        price:34.90, stock:22, badge:'',          imgUrl:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=70&fit=crop', tags:'Vegano',           ingredients:'Mix de folhas, tomate, pepino, azeitonas, feta.',cals:280, prot:10, carb:20, gord:16, peso:'290g',          preparo:'Folhas higienizadas com ozÃ´nio, sem alvejantes quÃ­micos. Azeite extra virgem acondicionado separado para preservar polifenÃ³is. Feta em quantidade controlada para equilÃ­brio de sÃ³dio. Zero temperos industrializados.', ativo:true,  destaque:false },
    { id:6, name:'SalmÃ£o com Aspargos',     slug:'salmao-aspargos',      cat:'ProteÃ­nas',        desc:'FilÃ© de salmÃ£o grelhado com limÃ£o e aspargos frescos.',                          price:54.90, stock:12, badge:'',          imgUrl:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=80&q=70&fit=crop', tags:'Sem glÃºten',       ingredients:'SalmÃ£o, aspargos, limÃ£o, azeite, ervas.',       cals:420, prot:38, carb:8,  gord:22, peso:'350g',          preparo:'SalmÃ£o grelhado em baixa temperatura na chapa de pedra â€” tÃ©cnica que sela a proteÃ­na sem ressecar. Aspargos salteados por 2 min em azeite extra virgem para manter textura e nutrientes. Sem molho industrializado.', ativo:true,  destaque:false },
    { id:7, name:'Energy Balls de Cacau',   slug:'energy-balls-cacau',   cat:'Snacks',           desc:'Bolinhas energÃ©ticas de cacau, tÃ¢mara e castanhas.',                             price:24.90, stock:50, badge:'',          imgUrl:'https://images.unsplash.com/photo-1548168035-7e0e0eada62b?w=80&q=70&fit=crop', tags:'Vegano, Sem glÃºten', ingredients:'TÃ¢mara, cacau, castanha, aveia, mel.',          cals:180, prot:5,  carb:28, gord:8,  peso:'120g (6 un.)',  preparo:'Preparadas sem forno nem calor (raw food). AdoÃ§adas exclusivamente com tÃ¢maras medjool â€” sem aÃ§Ãºcar refinado, sem adoÃ§ante artificial. Sem farinha, sem glÃºten, sem conservante. Processo 100% artesanal.', ativo:true,  destaque:false },
    { id:8, name:'Kit Semanal EquilÃ­brio',  slug:'kit-semanal-equilibrio',cat:'Kits',            desc:'5 refeiÃ§Ãµes balanceadas selecionadas para uma semana completa.',                  price:189.90,stock:8,  badge:'KIT',       imgUrl:'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=80&q=70&fit=crop', tags:'',                 ingredients:'Varia conforme seleÃ§Ã£o da semana.',             cals:400, prot:30, carb:40, gord:15, peso:'~1,8kg (5 ref.)', preparo:'Cada marmita montada pela nutricionista com equilÃ­brio entre 380â€“450 kcal. TÃ©cnicas variadas ao longo da semana: grelhado, vapor e cru â€” para mÃ¡xima absorÃ§Ã£o de nutrientes. Sem frituras, sem realÃ§adores de sabor, sem sÃ³dio excessivo.', ativo:true,  destaque:true  }
  ];
  let editingProductId = null;

  function renderAdminProdutos() {
    const rows = PRODUCTS.map(p => `
      <div class="adm-trow">
        <img class="adm-timg" src="${p.imgUrl}" alt="${p.name}">
        <div><div class="adm-pname">${p.name}</div><div class="adm-ptags">${p.tags || 'â€”'}</div></div>
        <div class="adm-pprice">${fmtBRL(p.price)}</div>
        <div class="adm-pstock">${p.stock}</div>
        <div><span class="${p.ativo ? 'badge-ativo' : 'badge-inativo'}">${p.ativo ? 'ATIVO' : 'INATIVO'}</span></div>
        <div class="adm-pacts">
          <button class="adm-pact" title="${p.ativo ? 'Desativar' : 'Ativar'}" onclick="toggleProductStatus(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p.ativo ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>' : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'}</svg>
          </button>
          <button class="adm-pact" title="Editar" onclick="openProductEdit(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="adm-pact del" title="Excluir" onclick="deleteProduct(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>`).join('');

    document.getElementById('admin-section-produtos').innerHTML = `
      <div class="adm-prod-hd">
        <div>
          <div class="adm-title">Produtos</div>
          <p class="adm-sub">${PRODUCTS.length} produtos cadastrados</p>
        </div>
        <button class="btn-new-prod" onclick="openProductEdit(null)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo produto
        </button>
      </div>
      <div class="adm-table">
        <div class="adm-thead">
          <div></div>
          <div class="adm-th">PRODUTO</div>
          <div class="adm-th">PREÃ‡O</div>
          <div class="adm-th">ESTOQUE</div>
          <div class="adm-th">STATUS</div>
          <div></div>
        </div>
        ${rows}
      </div>`;
  }

  function toggleProductStatus(id) {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return;
    p.ativo = !p.ativo;
    renderAdminProdutos();
    showToast(p.name + (p.ativo ? ' ativado' : ' desativado'));
  }

  function deleteProduct(id) {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return;
    if (!confirm('Excluir "' + p.name + '"?')) return;
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    renderAdminProdutos();
    showToast('Produto excluÃ­do');
  }

  function openProductEdit(id) {
    editingProductId = id;
    const cats = ['Saladas','Bowls','Sucos & Smoothies','ProteÃ­nas','Snacks','Kits'];
    const p = id ? PRODUCTS.find(p => p.id === id) : { name:'', slug:'', cat:'Saladas', desc:'', price:'', stock:'', badge:'', imgUrl:'', tags:'', ingredients:'', cals:'', prot:'', carb:'', gord:'', ativo:true, destaque:false };
    const catOpts = cats.map(c => `<option${p.cat===c?' selected':''}>${c}</option>`).join('');
    document.getElementById('pedit-modal').innerHTML = `
      <div class="pedit-title">${id ? 'Editar produto' : 'Novo produto'}</div>
      <button class="pedit-close" onclick="closeProductEdit()">Ã—</button>

      <div class="pf-group"><label>NOME *</label><input id="pf-name" value="${p.name}"></div>
      <div class="pf-cols2">
        <div class="pf-group"><label>SLUG (AUTO SE VAZIO)</label><input id="pf-slug" value="${p.slug}"></div>
        <div class="pf-group"><label>CATEGORIA</label><select id="pf-cat">${catOpts}</select></div>
      </div>
      <div class="pf-group"><label>DESCRIÃ‡ÃƒO</label><textarea id="pf-desc">${p.desc}</textarea></div>
      <div class="pf-cols3">
        <div class="pf-group"><label>PREÃ‡O (R$) *</label><input id="pf-price" type="number" step="0.01" value="${p.price}"></div>
        <div class="pf-group"><label>ESTOQUE</label><input id="pf-stock" type="number" value="${p.stock}"></div>
        <div class="pf-group"><label>BADGE</label><input id="pf-badge" value="${p.badge}"></div>
      </div>
      <div class="pf-group"><label>URL DA IMAGEM</label><input id="pf-img" value="${p.imgUrl}"></div>
      <div class="pf-group"><label>TAGS (VÃRGULA)</label><input id="pf-tags" value="${p.tags}"></div>
      <div class="pf-group"><label>INGREDIENTES</label><textarea id="pf-ingr">${p.ingredients}</textarea></div>
      <div class="pf-cols4">
        <div class="pf-group"><label>CALORIAS</label><input id="pf-cals" type="number" value="${p.cals}"></div>
        <div class="pf-group"><label>PROTEÃNA (G)</label><input id="pf-prot" type="number" value="${p.prot}"></div>
        <div class="pf-group"><label>CARB. (G)</label><input id="pf-carb" type="number" value="${p.carb}"></div>
        <div class="pf-group"><label>GORD. (G)</label><input id="pf-gord" type="number" step="0.1" value="${p.gord}"></div>
      </div>
      <div class="pf-toggles">
        <label class="pf-toggle-lbl">
          <label class="pf-switch"><input type="checkbox" id="pf-ativo"${p.ativo?' checked':''}><span class="pf-track"></span></label>
          Ativo
        </label>
        <label class="pf-toggle-lbl">
          <label class="pf-switch"><input type="checkbox" id="pf-destaque"${p.destaque?' checked':''}><span class="pf-track"></span></label>
          Destaque
        </label>
      </div>
      <div class="pedit-actions">
        <button class="btn-pedit-cancel" onclick="closeProductEdit()">Cancelar</button>
        <button class="btn-pedit-save" onclick="saveProduct()">Salvar</button>
      </div>
    `;
    document.getElementById('pedit-overlay').classList.add('open');
  }

  function closeProductEdit() {
    document.getElementById('pedit-overlay').classList.remove('open');
  }

  function saveProduct() {
    const name = document.getElementById('pf-name').value.trim();
    if (!name) { alert('Nome obrigatÃ³rio'); return; }
    const slug = document.getElementById('pf-slug').value.trim() || name.toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'');
    const data = {
      name, slug,
      cat:  document.getElementById('pf-cat').value,
      desc: document.getElementById('pf-desc').value,
      price: parseFloat(document.getElementById('pf-price').value) || 0,
      stock: parseInt(document.getElementById('pf-stock').value) || 0,
      badge: document.getElementById('pf-badge').value,
      imgUrl: document.getElementById('pf-img').value,
      tags:  document.getElementById('pf-tags').value,
      ingredients: document.getElementById('pf-ingr').value,
      cals: parseFloat(document.getElementById('pf-cals').value)||0,
      prot: parseFloat(document.getElementById('pf-prot').value)||0,
      carb: parseFloat(document.getElementById('pf-carb').value)||0,
      gord: parseFloat(document.getElementById('pf-gord').value)||0,
      ativo:    document.getElementById('pf-ativo').checked,
      destaque: document.getElementById('pf-destaque').checked
    };
    if (editingProductId) {
      const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
      PRODUCTS[idx] = { ...PRODUCTS[idx], ...data };
    } else {
      data.id = Math.max(...PRODUCTS.map(p => p.id), 0) + 1;
      PRODUCTS.push(data);
    }
    closeProductEdit();
    renderAdminProdutos();
    showToast(editingProductId ? 'Produto atualizado' : 'Produto criado');
  }

  // â”€â”€ TEAM MODALS â”€â”€
  const TEAM = [
    {
      id: 'helena',
      name: 'Helena Bento',
      role: 'CHEF FUNDADORA',
      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80&fit=crop&crop=faces',
      formacao: [
        'Gastronomia â€” Anhembi Morumbi, 2014',
        'EspecializaÃ§Ã£o em Cozinha SaudÃ¡vel â€” Barcelona',
        'AlimentaÃ§Ã£o Consciente â€” Instituto SEVA',
      ],
      historia: 'Cresci vendo minha avÃ³ transformar ingredientes simples do quintal em receitas que cuidavam da famÃ­lia inteira. Foi ela quem me ensinou que comida de verdade nÃ£o precisa de rÃ³tulos â€” precisa de afeto, de tempo e de respeito pelo ingrediente. Depois de seis anos em restaurantes vegetarianos de SÃ£o Paulo, decidi parar de trabalhar para outros e criar um lugar que fosse completamente honesto com o que acredita. A Bendita nasceu dessa vontade de provar que comer bem pode ser o maior ato de carinho que vocÃª dÃ¡ a si mesmo.'
    },
    {
      id: 'rafael',
      name: 'Rafael Couto',
      role: 'CHEF EXECUTIVO',
      img: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=700&q=80&fit=crop&crop=faces',
      formacao: [
        'Gastronomia â€” Le Cordon Bleu SÃ£o Paulo, 2016',
        'EstÃ¡gio em restaurante estrelado â€” Lisboa',
        'EspecializaÃ§Ã£o em cocÃ§Ã£o a baixa temperatura',
      ],
      historia: 'Por anos fui um chef de fine dining, obcecado com tÃ©cnicas francesas e apresentaÃ§Ãµes milimetradas. Quando a Helena me convidou para a Bendita, achei que ia precisar "simplificar" o meu trabalho. Descobri o oposto: fazer algo saudÃ¡vel que tambÃ©m seja absolutamente delicioso Ã© o desafio culinÃ¡rio mais honesto que jÃ¡ enfrentei. NÃ£o tem como esconder atrÃ¡s de um molho pesado ou de um ingrediente caro. Aqui o ingrediente precisa falar por si mesmo â€” e isso me tornou um chef muito melhor.'
    },
    {
      id: 'marta',
      name: 'Marta Lins',
      role: 'NUTRICIONISTA',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&q=80&fit=crop&crop=faces',
      formacao: [
        'NutriÃ§Ã£o â€” USP, 2015',
        'Mestrado em NutriÃ§Ã£o Funcional e Integrativa â€” UNIFESP, 2018',
        'CRN 12345-SP',
      ],
      historia: 'Passei anos em consultÃ³rio vendo pessoas que queriam comer saudÃ¡vel, mas sofriam com isso â€” comida sem graÃ§a, sem prazer, sem vontade. Elas chegavam com planilhas de calorias e saÃ­am com a sensaÃ§Ã£o de que comer bem era uma puniÃ§Ã£o. A Bendita Ã© minha resposta pessoal para esse problema. Cada prato que aprovo aqui precisa passar em dois testes: nutriÃ§Ã£o real e vontade genuÃ­na de comer de novo. Se passar nos dois, vai pro cardÃ¡pio. Se nÃ£o, a gente volta pra cozinha.'
    }
  ];

  function openTeamModal(id) {
    const m = TEAM.find(t => t.id === id);
    if (!m) return;
    const tags = m.formacao.map(f => `<span class="team-modal-tag">${f}</span>`).join('');
    document.getElementById('team-modal').innerHTML = `
      <div class="team-modal-photo">
        <img src="${m.img}" alt="${m.name}">
      </div>
      <div class="team-modal-body">
        <button class="team-modal-close" onclick="closeTeamModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <p class="team-modal-role">${m.role}</p>
        <h2 class="team-modal-name">${m.name}</h2>
        <p class="team-modal-sec">FORMAÃ‡ÃƒO</p>
        <div class="team-modal-tags">${tags}</div>
        <p class="team-modal-sec">SUA HISTÃ“RIA</p>
        <p class="team-modal-story">"${m.historia}"</p>
      </div>
    `;
    document.getElementById('team-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTeamModal() {
    document.getElementById('team-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // â”€â”€ ADMIN DASHBOARD â”€â”€

  // â”€â”€ INSIGHTS DATA (Ãºltimas 4 semanas) â”€â”€
  const WEEKLY_DATA = [
    { dow: 1, label: 'Seg', orders: 34, revenue: 2840 },
    { dow: 2, label: 'Ter', orders: 41, revenue: 3510 },
    { dow: 3, label: 'Qua', orders: 52, revenue: 4320 },
    { dow: 4, label: 'Qui', orders: 48, revenue: 3980 },
    { dow: 5, label: 'Sex', orders: 67, revenue: 5640 },
    { dow: 6, label: 'SÃ¡b', orders: 78, revenue: 6820 },
    { dow: 0, label: 'Dom', orders: 45, revenue: 3740 },
  ];

  const PRODUCT_SALES = [
    { name: 'Detox Verde',            units: 112, revenue: 2116.80 },
    { name: 'Poke Bowl de SalmÃ£o',    units: 89,  revenue: 3813.10 },
    { name: 'Bowl AÃ§aÃ­ Funcional',    units: 76,  revenue: 2196.40 },
    { name: 'Energy Balls de Cacau',  units: 71,  revenue: 1768.90 },
    { name: 'Salada CÃ©sar de Frango', units: 58,  revenue: 2256.20 },
    { name: 'SalmÃ£o com Aspargos',    units: 43,  revenue: 2360.70 },
    { name: 'Salada MediterrÃ¢nea',    units: 39,  revenue: 1361.10 },
    { name: 'Kit Semanal EquilÃ­brio', units: 34,  revenue: 6456.60 },
  ];

  let insightMode = 'units';

  function renderAdminInsights() {
    const todayDow = new Date().getDay();
    const maxOrders = Math.max(...WEEKLY_DATA.map(d => d.orders));

    const dayRows = WEEKLY_DATA.map(d => {
      const isToday = d.dow === todayDow;
      const pct = Math.round((d.orders / maxOrders) * 100);
      return `
        <div class="ins-bar-row${isToday ? ' today' : ''}">
          <span class="ins-bar-label">${d.label}${isToday ? ' â—†' : ''}</span>
          <div class="ins-bar-track"><div class="ins-bar-fill" style="width:${pct}%"></div></div>
          <span class="ins-bar-val">${d.orders} ped.</span>
        </div>`;
    }).join('');

    const sorted = [...PRODUCT_SALES].sort((a, b) =>
      insightMode === 'units' ? b.units - a.units : b.revenue - a.revenue
    );
    const maxVal = Math.max(...sorted.map(p => insightMode === 'units' ? p.units : p.revenue));
    const rankClass = ['gold', 'silver', 'bronze'];

    const prodRows = sorted.map((p, i) => {
      const val  = insightMode === 'units' ? p.units : p.revenue;
      const pct  = Math.round((val / maxVal) * 100);
      const fmtV = insightMode === 'units' ? `${val} un.` : fmtBRL(val);
      const fillColor = i === 0 ? 'var(--burgundy)' : 'var(--green-mid)';
      const rc = rankClass[i] || '';
      return `
        <div class="ins-prod-row">
          <span class="ins-prod-rank ${rc}">${i + 1}</span>
          <div>
            <div class="ins-prod-name" title="${p.name}">${p.name}</div>
            <div class="ins-bar-track"><div class="ins-bar-fill" style="width:${pct}%;background:${fillColor}"></div></div>
          </div>
          <span class="ins-prod-val">${fmtV}</span>
        </div>`;
    }).join('');

    document.getElementById('metricas-insights').innerHTML = `
      <div class="ins-card">
        <div class="ins-card-header">
          <span class="ins-card-title">PEDIDOS POR DIA DA SEMANA</span>
          <span class="ins-subtitle">mÃ©dia â€” 4 semanas</span>
        </div>
        ${dayRows}
      </div>
      <div class="ins-card">
        <div class="ins-card-header">
          <span class="ins-card-title">PRODUTOS MAIS VENDIDOS</span>
          <div class="ins-toggle">
            <button class="${insightMode === 'units' ? 'active' : ''}" onclick="setInsightMode('units')">Unid.</button>
            <button class="${insightMode === 'revenue' ? 'active' : ''}" onclick="setInsightMode('revenue')">Receita</button>
          </div>
        </div>
        ${prodRows}
      </div>
    `;
  }

  function setInsightMode(mode) {
    insightMode = mode;
    renderAdminInsights();
  }

  function renderAdminMetrics() {
    const totalOrders  = WEEKLY_DATA.reduce((s, d) => s + d.orders, 0);
    const totalRevenue = WEEKLY_DATA.reduce((s, d) => s + d.revenue, 0);
    const ticketMedio  = totalRevenue / totalOrders;
    const bestDay      = [...WEEKLY_DATA].sort((a, b) => b.orders - a.orders)[0];
    const cancelled    = ORDERS.filter(o => o.status === 'cancelado').length;
    const cancelRate   = Math.round((cancelled / ORDERS.length) * 100);

    document.getElementById('metricas-kpis').innerHTML = `
      <div class="stat-card c-green">
        <span class="stat-num">${fmtBRL(ticketMedio)}</span>
        <span class="stat-label">TICKET MÃ‰DIO</span>
      </div>
      <div class="stat-card c-green">
        <span class="stat-num">${fmtBRL(totalRevenue / 4)}</span>
        <span class="stat-label">RECEITA MÃ‰DIA / SEMANA</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">${bestDay.label}</span>
        <span class="stat-label">DIA MAIS FORTE</span>
      </div>
      <div class="stat-card${cancelRate > 15 ? ' c-burg' : ''}">
        <span class="stat-num">${cancelRate}%</span>
        <span class="stat-label">TAXA DE CANCELAMENTO</span>
      </div>
    `;

    renderAdminInsights();
  }

  const ORDERS = [
    {
      id: 12847, time: '14:23', status: 'entrega',
      cliente: 'Ana Lima', tel: '(11) 98765-4321',
      addr: 'Rua das Flores, 45 â€” Vila Madalena, SP',
      pagamento: 'PIX confirmado',
      items: [
        { name: 'Poke Bowl de SalmÃ£o', qty: 1, price: 42.90 },
        { name: 'Detox Verde', qty: 1, price: 18.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '14:23', note: 'Pagamento PIX confirmado', done: true },
        { label: 'Em preparo', time: '14:28', note: 'Cozinha iniciou a preparaÃ§Ã£o', done: true },
        { label: 'Saiu para entrega', time: '14:47', note: 'Entregador a caminho', active: true },
        { label: 'Entregue', time: null, note: 'PrevisÃ£o: 15h10', done: false }
      ]
    },
    {
      id: 12846, time: '14:15', status: 'preparo',
      cliente: 'Carlos Mendes', tel: '(11) 97654-3210',
      addr: 'Av. Paulista, 1000 â€” Bela Vista, SP',
      pagamento: 'CartÃ£o de crÃ©dito',
      items: [
        { name: 'Kit Semanal EquilÃ­brio', qty: 1, price: 189.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '14:15', note: 'Pagamento aprovado', done: true },
        { label: 'Em preparo', time: '14:20', note: 'Cozinha iniciou a preparaÃ§Ã£o', active: true },
        { label: 'Saiu para entrega', time: null, note: '', done: false },
        { label: 'Entregue', time: null, note: '', done: false }
      ]
    },
    {
      id: 12845, time: '14:02', status: 'preparo',
      cliente: 'Priya Santos', tel: '(11) 96543-2109',
      addr: 'Rua Augusta, 234 â€” ConsolaÃ§Ã£o, SP',
      pagamento: 'PIX confirmado',
      items: [
        { name: 'Salada CÃ©sar de Frango', qty: 1, price: 38.90 },
        { name: 'Energy Balls de Cacau', qty: 1, price: 18.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '14:02', note: 'Pagamento PIX confirmado', done: true },
        { label: 'Em preparo', time: '14:08', note: 'Cozinha iniciou a preparaÃ§Ã£o', active: true },
        { label: 'Saiu para entrega', time: null, note: '', done: false },
        { label: 'Entregue', time: null, note: '', done: false }
      ]
    },
    {
      id: 12844, time: '13:55', status: 'preparo',
      cliente: 'Mariana Costa', tel: '(11) 95432-1098',
      addr: 'Al. Santos, 78 â€” Jardins, SP',
      pagamento: 'PIX confirmado',
      items: [
        { name: 'Bowl AÃ§aÃ­ Funcional', qty: 2, price: 28.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '13:55', note: 'Pagamento PIX confirmado', done: true },
        { label: 'Em preparo', time: '14:01', note: 'Cozinha iniciou a preparaÃ§Ã£o', active: true },
        { label: 'Saiu para entrega', time: null, note: '', done: false },
        { label: 'Entregue', time: null, note: '', done: false }
      ]
    },
    {
      id: 12843, time: '13:30', status: 'entregue',
      cliente: 'Rafael Couto', tel: '(11) 94321-0987',
      addr: 'Rua da ConsolaÃ§Ã£o, 56 â€” HigienÃ³polis, SP',
      pagamento: 'CartÃ£o de dÃ©bito',
      items: [
        { name: 'SalmÃ£o com Aspargos', qty: 1, price: 54.90 },
        { name: 'Detox Verde', qty: 1, price: 18.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '13:30', note: 'Pagamento aprovado', done: true },
        { label: 'Em preparo', time: '13:36', note: 'Cozinha iniciou a preparaÃ§Ã£o', done: true },
        { label: 'Saiu para entrega', time: '13:55', note: 'Entregador a caminho', done: true },
        { label: 'Entregue', time: '14:18', note: 'Entregue com sucesso', done: true }
      ]
    },
    {
      id: 12842, time: '13:15', status: 'entregue',
      cliente: 'Beatriz Alves', tel: '(11) 93210-9876',
      addr: 'Rua Oscar Freire, 12 â€” Jardins, SP',
      pagamento: 'PIX confirmado',
      items: [
        { name: 'Salada MediterrÃ¢nea', qty: 1, price: 34.90 },
        { name: 'Detox Verde', qty: 2, price: 18.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '13:15', note: 'Pagamento PIX confirmado', done: true },
        { label: 'Em preparo', time: '13:22', note: 'Cozinha iniciou a preparaÃ§Ã£o', done: true },
        { label: 'Saiu para entrega', time: '13:40', note: 'Entregador a caminho', done: true },
        { label: 'Entregue', time: '14:05', note: 'Entregue com sucesso', done: true }
      ]
    },
    {
      id: 12841, time: '12:50', status: 'entregue',
      cliente: 'JoÃ£o Silva', tel: '(11) 92109-8765',
      addr: 'Rua Haddock Lobo, 88 â€” Cerqueira CÃ©sar, SP',
      pagamento: 'CartÃ£o de crÃ©dito',
      items: [
        { name: 'Poke Bowl de SalmÃ£o', qty: 1, price: 42.90 },
        { name: 'Kit Semanal EquilÃ­brio', qty: 1, price: 189.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '12:50', note: 'Pagamento aprovado', done: true },
        { label: 'Em preparo', time: '12:55', note: 'Cozinha iniciou a preparaÃ§Ã£o', done: true },
        { label: 'Saiu para entrega', time: '13:15', note: 'Entregador a caminho', done: true },
        { label: 'Entregue', time: '13:52', note: 'Entregue com sucesso', done: true }
      ]
    },
    {
      id: 12840, time: '12:30', status: 'cancelado',
      cliente: 'Lucas Freitas', tel: '(11) 91098-7654',
      addr: 'Rua da ConsolaÃ§Ã£o, 300 â€” Vila Buarque, SP',
      pagamento: 'PIX â€” reembolso pendente',
      items: [
        { name: 'Energy Balls de Cacau', qty: 3, price: 24.90 }
      ],
      timeline: [
        { label: 'Pedido recebido', time: '12:30', note: 'Pagamento PIX confirmado', done: true },
        { label: 'Cancelado pelo cliente', time: '12:35', note: 'Reembolso em processamento', done: true },
        { label: 'Saiu para entrega', time: null, note: '', done: false },
        { label: 'Entregue', time: null, note: '', done: false }
      ]
    }
  ];

  const STATUS_META = {
    novo:      { label: 'NOVO',        badge: 's-novo',     next: 'preparo',  nextLabel: 'Iniciar Preparo' },
    preparo:   { label: 'EM PREPARO',  badge: 's-preparo',  next: 'entrega',  nextLabel: 'Enviar p/ Entrega' },
    entrega:   { label: 'EM ENTREGA',  badge: 's-entrega',  next: 'entregue', nextLabel: 'Confirmar Entrega' },
    entregue:  { label: 'ENTREGUE',    badge: 's-entregue', next: null,       nextLabel: null },
    cancelado: { label: 'CANCELADO',   badge: 's-cancelado',next: null,       nextLabel: null }
  };

  let adminFilter = 'todos';
  let adminSelectedId = null;
  let adminClockTimer = null;

  function orderTotal(o) {
    return o.items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function fmtBRL(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function renderAdminStats() {
    const total = ORDERS.length;
    const preparo = ORDERS.filter(o => o.status === 'preparo').length;
    const entrega = ORDERS.filter(o => o.status === 'entrega').length;
    const novos = ORDERS.filter(o => o.status === 'novo').length;
    const receita = ORDERS.filter(o => o.status !== 'cancelado').reduce((s, o) => s + orderTotal(o), 0);
    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-card">
        <span class="stat-num">${total}</span>
        <span class="stat-label">PEDIDOS HOJE</span>
      </div>
      <div class="stat-card c-burg">
        <span class="stat-num">${novos + preparo}</span>
        <span class="stat-label">EM PREPARO / NOVOS</span>
      </div>
      <div class="stat-card c-green">
        <span class="stat-num">${entrega}</span>
        <span class="stat-label">EM ENTREGA</span>
      </div>
      <div class="stat-card c-green">
        <span class="stat-num">${fmtBRL(receita)}</span>
        <span class="stat-label">RECEITA DO DIA</span>
      </div>
    `;
  }

  function renderAdminToolbar() {
    const counts = {
      todos: ORDERS.length,
      novo: ORDERS.filter(o => o.status === 'novo').length,
      preparo: ORDERS.filter(o => o.status === 'preparo').length,
      entrega: ORDERS.filter(o => o.status === 'entrega').length,
      entregue: ORDERS.filter(o => o.status === 'entregue').length,
      cancelado: ORDERS.filter(o => o.status === 'cancelado').length
    };
    const tabs = [
      { key: 'todos',    label: `TODOS (${counts.todos})` },
      { key: 'novo',     label: `NOVOS (${counts.novo})` },
      { key: 'preparo',  label: `EM PREPARO (${counts.preparo})` },
      { key: 'entrega',  label: `EM ENTREGA (${counts.entrega})` },
      { key: 'entregue', label: `ENTREGUES (${counts.entregue})` },
      { key: 'cancelado',label: `CANCELADOS (${counts.cancelado})` }
    ];
    document.getElementById('admin-toolbar').innerHTML = tabs.map(t =>
      `<button class="filter-btn${adminFilter === t.key ? ' active' : ''}" onclick="setAdminFilter('${t.key}')">${t.label}</button>`
    ).join('');
  }

  function setAdminFilter(key) {
    adminFilter = key;
    renderAdminToolbar();
    renderAdminList();
  }

  function renderAdminList() {
    const query = (document.getElementById('admin-search')?.value || '').toLowerCase();
    let filtered = ORDERS.filter(o => {
      if (adminFilter !== 'todos' && o.status !== adminFilter) return false;
      if (query) {
        const matchNum = String(o.id).includes(query);
        const matchCliente = o.cliente.toLowerCase().includes(query);
        if (!matchNum && !matchCliente) return false;
      }
      return true;
    });

    if (!filtered.length) {
      document.getElementById('admin-list').innerHTML = `<div class="pedidos-list-empty">Nenhum pedido encontrado.</div>`;
      return;
    }

    const checkSvg = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    document.getElementById('admin-list').innerHTML = filtered.map(o => {
      const meta = STATUS_META[o.status];
      const total = orderTotal(o);
      const itemsLabel = o.items.map(i => i.qty > 1 ? `${i.name} Ã— ${i.qty}` : i.name).join(' Â· ');
      const selected = adminSelectedId === o.id;
      return `
        <div class="pedido-row${selected ? ' selected' : ''}${o.status === 'cancelado' ? ' cancelado' : ''}" onclick="selectOrder(${o.id})">
          <div>
            <div class="pedido-num">#${o.id}</div>
            <div class="pedido-time-tag">${o.time}</div>
          </div>
          <div>
            <div class="pedido-cliente">${o.cliente}</div>
            <div class="pedido-addr">${o.addr}</div>
            <div class="pedido-items-txt">${itemsLabel}</div>
          </div>
          <div class="pedido-right">
            <div class="pedido-total-val">${fmtBRL(total)}</div>
            <span class="status-badge ${meta.badge}">${meta.label}</span>
          </div>
        </div>`;
    }).join('');
  }

  function selectOrder(id) {
    adminSelectedId = id;
    renderAdminList();
    renderAdminDetail();
  }

  function renderAdminDetail() {
    const o = ORDERS.find(o => o.id === adminSelectedId);
    if (!o) return;
    const meta = STATUS_META[o.status];
    const total = orderTotal(o);
    const delivery = total >= 80 ? 'GrÃ¡tis' : fmtBRL(8.90);
    const deliveryVal = total >= 80 ? 0 : 8.90;
    const checkSvg = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

    const timelineHtml = o.timeline.map(step => {
      let dotClass = 'pend';
      let dotContent = '';
      if (step.done || step.active) {
        dotClass = step.active ? 'active' : 'done';
        dotContent = checkSvg;
      }
      return `
        <div class="tl-step">
          <div class="tl-dot ${dotClass}">${dotContent}</div>
          <div class="tl-info">
            <strong>${step.label}</strong>
            <span>${step.time ? step.time + (step.note ? ' â€” ' + step.note : '') : (step.note || 'â€”')}</span>
          </div>
        </div>`;
    }).join('');

    const itemsHtml = o.items.map(i => {
      const prod = PRODUCTS.find(p => p.name === i.name);
      const macroLine = prod ? `<div class="detail-info-row" style="font-size:11px;color:var(--text-light);padding:2px 0 0"><span>${prod.peso} Â· ${prod.cals} kcal Â· P ${prod.prot}g Â· C ${prod.carb}g Â· G ${prod.gord}g</span></div>` : '';
      const preparoBlock = prod && prod.preparo ? `
        <div class="detail-preparo-block">
          <div class="detail-preparo-title">MODO DE PREPARO SAUDÃVEL</div>
          <div class="detail-preparo-text">${prod.preparo}</div>
        </div>` : '';
      return `<div class="detail-info-row"><span>${i.name}${i.qty > 1 ? ' Ã— ' + i.qty : ''}</span><span>${fmtBRL(i.price * i.qty)}</span></div>${macroLine}${preparoBlock}`;
    }).join('');

    const canAdvance = meta.next !== null && o.status !== 'cancelado';
    const canCancel  = o.status !== 'entregue' && o.status !== 'cancelado';

    document.getElementById('admin-detail').innerHTML = `
      <div class="detail-top">
        <div class="detail-top-left">
          <h3>Pedido #${o.id}</h3>
          <span>Recebido Ã s ${o.time} Â· ${o.pagamento}</span>
        </div>
        <span class="status-badge ${meta.badge}">${meta.label}</span>
      </div>

      <div class="detail-section">
        <p class="detail-sec-label">CLIENTE</p>
        <div class="detail-info-row"><span>Nome</span><span>${o.cliente}</span></div>
        <div class="detail-info-row"><span>Telefone</span><span>${o.tel}</span></div>
        <div class="detail-info-row"><span>EndereÃ§o</span><span style="max-width:180px">${o.addr}</span></div>
      </div>

      <div class="detail-section">
        <p class="detail-sec-label">ITENS DO PEDIDO</p>
        ${itemsHtml}
        <hr class="detail-divider">
        <div class="detail-info-row"><span>Subtotal</span><span>${fmtBRL(total)}</span></div>
        <div class="detail-info-row"><span>Entrega</span><span>${delivery}</span></div>
        <hr class="detail-divider">
        <div class="detail-total-row"><span>Total</span><span>${fmtBRL(total + deliveryVal)}</span></div>
      </div>

      <div class="detail-section">
        <p class="detail-sec-label">ACOMPANHAMENTO</p>
        <div class="timeline">${timelineHtml}</div>
      </div>

      <div class="detail-actions">
        <button class="btn-advance" ${canAdvance ? '' : 'disabled'} onclick="advanceOrder(${o.id})">
          ${canAdvance ? meta.nextLabel : (o.status === 'entregue' ? 'ConcluÃ­do' : 'Cancelado')}
        </button>
        <button class="btn-cancel-order" ${canCancel ? '' : 'disabled'} onclick="cancelOrder(${o.id})">Cancelar</button>
      </div>
    `;
  }

  function advanceOrder(id) {
    const o = ORDERS.find(o => o.id === id);
    if (!o) return;
    const meta = STATUS_META[o.status];
    if (!meta.next) return;
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    const prevActiveIdx = o.timeline.findIndex(s => s.active);
    if (prevActiveIdx >= 0) { o.timeline[prevActiveIdx].active = false; o.timeline[prevActiveIdx].done = true; }
    const nextActiveIdx = prevActiveIdx + 1;
    if (nextActiveIdx < o.timeline.length) {
      o.timeline[nextActiveIdx].time = timeStr;
      if (meta.next === 'entregue') {
        o.timeline[nextActiveIdx].done = true;
        o.timeline[nextActiveIdx].note = 'Entregue com sucesso';
      } else {
        o.timeline[nextActiveIdx].active = true;
      }
    }
    o.status = meta.next;
    renderAdminStats();
    renderAdminToolbar();
    renderAdminList();
    renderAdminDetail();
    showToast('Status atualizado: ' + STATUS_META[o.status].label);
  }

  function cancelOrder(id) {
    const o = ORDERS.find(o => o.id === id);
    if (!o) return;
    o.status = 'cancelado';
    o.timeline.forEach(s => { s.active = false; });
    renderAdminStats();
    renderAdminToolbar();
    renderAdminList();
    renderAdminDetail();
    showToast('Pedido #' + id + ' cancelado');
  }


