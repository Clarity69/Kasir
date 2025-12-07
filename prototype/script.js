/* script.js: Jotun kasir + modal color picker (palet tervalidasi) + custom color add + 58mm struk */

/* Katalog awal */
const PRODUCTS = [
  { kode: 'P001', nama: 'Cat Dinding 5L (Premium)', harga: 250000, hasColor: true },
  { kode: 'P002', nama: 'Cat Plafon 2.5L', harga: 120000, hasColor: true },
  { kode: 'P003', nama: 'Cat Dasar / Primer 5L', harga: 180000, hasColor: true },
  { kode: 'B001', nama: 'Kuas Besar 3"', harga: 35000, hasColor: false },
];

let cart = [];

/* konfigurasi toko */
const logoSrc = 'Assets/jotun-black.png';
const shopName = 'Jotun';
const shopAddress = 'Jl. Selat Selayar, Tj. Laut, Kec. Bontang Selatan';
const shopPhone = 'Telp: 081369696969';

/* palet warna default */
let COLOR_PALETTE = [
  '#FFFFFF','#F2F2F2','#E6E6E6','#D9D9D9','#F7E6E6','#FFD6D6','#FFEFD5','#FFF2CC',
  '#FCE7D6','#DDEBF7','#CFE8D8','#DDEBF0','#E6E0F8','#F5EAF6','#FDEDEC','#F8F3E6',
  '#B0C4DE','#9FB8D1','#C2E0C6','#F2C6D1'
];

/* modal state */
let modalState = { kode: null, nama: null, harga: null, selectedColor: null };

/* inisialisasi */
document.addEventListener('DOMContentLoaded', () => {
  renderProductList();
  renderCart();

  document.getElementById('searchBox').addEventListener('input', filterProducts);
  document.getElementById('btnAddProduct').addEventListener('click', handleAddProduct);
  document.getElementById('btnPrint').addEventListener('click', printStruk);

  // modal buttons
  document.getElementById('modalCancel').addEventListener('click', closeColorModal);
  document.getElementById('modalAdd').addEventListener('click', confirmAddFromModal);
  document.getElementById('modalAddCustom').addEventListener('click', addCustomColorFromPicker);
});

/* render produk */
function renderProductList(){
  const container = document.getElementById('productList');
  container.innerHTML = '';
  PRODUCTS.forEach(p => {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.id = `prod-${p.kode}`;

    const sku = el('div','sku',p.kode);
    const name = el('div','name',p.nama);
    const meta = el('div','meta',`Rp ${p.harga.toLocaleString()}`);
    row.appendChild(sku); row.appendChild(name); row.appendChild(meta);

    if(p.hasColor){
      // tombol buka modal
      const btn = document.createElement('button');
      btn.className = 'primary'; btn.innerText = 'Pilih Warna';
      btn.onclick = () => openColorModal(p);
      row.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.className = 'primary'; btn.innerText = '+';
      btn.onclick = () => addToCart(p.kode, p.nama, p.harga, null, 1);
      row.appendChild(btn);
    }

    container.appendChild(row);
  });
}

function el(tag, cls, txt){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(txt !== undefined) e.innerText = txt;
  return e;
}

function filterProducts(){
  const q = document.getElementById('searchBox').value.toLowerCase();
  document.querySelectorAll('#productList .product-row').forEach(r=>{
    const name = (r.querySelector('.name')?.innerText || '').toLowerCase();
    const sku = (r.querySelector('.sku')?.innerText || '').toLowerCase();
    r.style.display = (name.includes(q) || sku.includes(q)) ? '' : 'none';
  });
}

/* add product via UI */
function handleAddProduct(){
  const kode = document.getElementById('newKode').value.trim();
  const nama = document.getElementById('newNama').value.trim();
  const harga = parseInt(document.getElementById('newHarga').value,10);
  const hasColor = document.getElementById('newHasColor').checked;

  if(!kode || !nama || !harga || isNaN(harga) || harga <= 0) return alert('Isi data produk dengan benar (kode, nama, harga angka > 0).');
  if(PRODUCTS.some(p => p.kode.toLowerCase() === kode.toLowerCase())) return alert('Kode sudah ada. Gunakan kode lain.');

  PRODUCTS.push({ kode, nama, harga, hasColor });
  renderProductList();
  document.getElementById('newKode').value = '';
  document.getElementById('newNama').value = '';
  document.getElementById('newHarga').value = '';
  document.getElementById('newHasColor').checked = false;
}

/* cart */
function addToCart(kode, nama, harga, color=null, qty=1){
  if(qty <= 0) return;
  const existing = cart.find(i => i.kode === kode && (i.color || null) === (color || null));
  if(existing) existing.qty += qty;
  else cart.push({ kode, nama, harga, qty: qty, color: color || null });
  renderCart();
}

function updateQty(kode, color, el){
  const v = parseInt(el.value) || 0;
  const item = cart.find(i => i.kode === kode && (i.color || null) === (color || null));
  if(!item) return;
  item.qty = v;
  if(item.qty <= 0) cart = cart.filter(i => !(i.kode === kode && (i.color || null) === (color || null)));
  renderCart();
}

function removeItem(kode, color){
  cart = cart.filter(i => !(i.kode === kode && (i.color || null) === (color || null)));
  renderCart();
}

function renderCart(){
  const box = document.getElementById('cartList');
  box.innerHTML = '';
  let subtotal = 0;
  if(cart.length === 0) box.innerHTML = '<div class="muted">Keranjang kosong.</div>';

  cart.forEach(item=>{
    const total = item.qty * item.harga;
    subtotal += total;

    const wrapper = document.createElement('div'); wrapper.className = 'cart-item';
    const left = document.createElement('div'); left.className = 'left';
    const right = document.createElement('div'); right.className = 'right';

    left.innerHTML = `<strong>${item.nama}</strong><br><small class="muted">Rp ${item.harga.toLocaleString()}</small>`;

    if(item.color){
      const colorLine = document.createElement('div'); colorLine.className = 'color-line';
      const sw = document.createElement('div'); sw.className = 'swatch'; sw.style.background = item.color;
      const hex = document.createElement('small'); hex.className = 'muted'; hex.innerText = item.color;
      colorLine.appendChild(sw); colorLine.appendChild(hex);
      left.appendChild(colorLine);
    }

    const input = document.createElement('input'); input.type='number'; input.min='1'; input.value=item.qty;
    input.onchange = function(){ updateQty(item.kode, item.color, this); };

    const del = document.createElement('button'); del.className='danger'; del.innerText='✕';
    del.onclick = () => removeItem(item.kode, item.color);

    right.appendChild(input); right.appendChild(del);
    wrapper.appendChild(left); wrapper.appendChild(right);
    box.appendChild(wrapper);
  });

  document.getElementById('subtotalValue').innerText = "Rp " + subtotal.toLocaleString();
  document.getElementById('totalValue').innerText = "Rp " + subtotal.toLocaleString();
}

/* ===== Modal: show palette swatches and handle selection ===== */
function openColorModal(product){
  modalState = { kode: product.kode, nama: product.nama, harga: product.harga, selectedColor: null };
  document.getElementById('modalProductName').innerText = `${product.nama} — Rp ${product.harga.toLocaleString()}`;
  document.getElementById('modalQty').value = 1;
  document.getElementById('modalWarning').style.display = 'none';

  // render swatch palette
  renderSwatchPalette();

  // reset custom inputs
  document.getElementById('modalCustomColor').value = '#ffffff';
  document.getElementById('modalCustomName').value = '';

  // show modal
  const modal = document.getElementById('colorModal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

function renderSwatchPalette(){
  const container = document.getElementById('swatchContainer');
  container.innerHTML = '';
  COLOR_PALETTE.forEach(hex => {
    const item = document.createElement('div');
    item.className = 'swatch-item';
    item.title = hex;
    item.setAttribute('data-hex', hex);
    item.style.background = hex;
    item.onclick = () => selectSwatch(item, hex);
    container.appendChild(item);
  });
}

function selectSwatch(el, hex){
  // clear previous selection
  document.querySelectorAll('#swatchContainer .swatch-item').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  modalState.selectedColor = hex;
  document.getElementById('modalWarning').style.display = 'none';
}

/* ===== Add custom color from color input into palette and select it ===== */
function addCustomColorFromPicker(){
  const hexInput = document.getElementById('modalCustomColor').value.trim();
  const nameInput = document.getElementById('modalCustomName').value.trim();

  // normalize hex: ensure starts with #
  const hex = normalizeHex(hexInput);
  if(!isValidHex(hex)){
    alert('Warna tidak valid. Gunakan color picker atau masukkan hex yang benar (mis. #ff00aa).');
    return;
  }

  // if hex already exists in palette, just select it
  if(COLOR_PALETTE.indexOf(hex) === -1){
    // add to start so it's visible
    COLOR_PALETTE.unshift(hex);
  }

  // re-render palette and select the added color
  renderSwatchPalette();

  // find newly created swatch element and select it
  const el = Array.from(document.querySelectorAll('#swatchContainer .swatch-item'))
                 .find(s => s.getAttribute('data-hex').toUpperCase() === hex.toUpperCase());
  if(el) selectSwatch(el, hex);

  // optional: show name as tooltip (store mapping if needed)
  if(nameInput){
    el.title = `${hex} — ${nameInput}`;
  }
}

/* helper normalize / validate hex */
function normalizeHex(h){
  if(!h) return '';
  if(h[0] !== '#') h = '#' + h;
  return h.toUpperCase();
}
function isValidHex(h){
  return /^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(h);
}

/* close modal */
function closeColorModal(){
  const modal = document.getElementById('colorModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modalState = { kode: null, nama: null, harga: null, selectedColor: null };
}

/* confirm add from modal (validate selected color in palette) */
function confirmAddFromModal(){
  const qty = parseInt(document.getElementById('modalQty').value, 10) || 1;
  if(!modalState.kode) { closeColorModal(); return; }

  // validation: must have selectedColor and it's in COLOR_PALETTE
  const sel = modalState.selectedColor;
  if(!sel || COLOR_PALETTE.indexOf(sel) === -1){
    const w = document.getElementById('modalWarning');
    w.innerText = 'Silakan pilih warna dari palet resmi terlebih dahulu.';
    w.style.display = 'block';
    return;
  }

  addToCart(modalState.kode, modalState.nama, modalState.harga, sel, qty);
  closeColorModal();
}

/* ===== Print (58mm) ===== */
function printStruk(){
  if(cart.length === 0) return alert('Keranjang masih kosong!');
  const prev = document.getElementById('print-area'); if(prev) prev.remove();
  const printArea = document.createElement('div'); printArea.id = 'print-area';

  const now = new Date(); const invoiceNo = 'INV-' + now.getTime();
  let logoHtml = '';
  if(logoSrc) logoHtml = `<div class="logo"><img src="${logoSrc}" alt="logo" style="max-width:120px;width:100%;height:auto" /></div>`;

  const header = `
    ${logoHtml}
    <div class="shop-name">${shopName}</div>
    <div class="shop-info">${shopAddress} — ${shopPhone}</div>
    <div style="height:6px"></div>
    <div style="text-align:center;font-size:11px;">No: ${invoiceNo} | ${now.toLocaleString()}</div>
    <div class="divider"></div>
  `;

  let itemsHtml = `<div class="items">`;
  cart.forEach(i => {
    const total = i.qty * i.harga;
    const colorLine = i.color ? `\nWarna: ${i.color}` : '';
    itemsHtml += `
      <div class="row">
        <div class="left">${i.nama}${colorLine}<div style="font-size:11px;color:#333">Qty: ${i.qty}  @ Rp ${i.harga.toLocaleString()}</div></div>
        <div class="right">Rp ${total.toLocaleString()}</div>
      </div>
    `;
  });
  itemsHtml += `</div>`;

  const subtotal = cart.reduce((s,i)=> s + i.qty*i.harga, 0);
  const tot = `<div class="divider"></div>
    <div class="total"><div>Total</div><div>Rp ${subtotal.toLocaleString()}</div></div>
    <div class="divider"></div>
    <div class="thanks">Terima kasih — Selamat berbelanja!</div>
    <div style="height:8px"></div>
  `;

  printArea.innerHTML = header + itemsHtml + tot;
  document.body.appendChild(printArea);
  window.print();
  setTimeout(()=>{ printArea.remove(); }, 1200);
}
