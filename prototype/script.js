/* script.js: Jotun kasir + 58mm invoice template (logo: assets/jotun.svg) */

/* Katalog awal */
const PRODUCTS = [
  { kode: 'P001', nama: 'Cat Dinding 5L (Premium)', harga: 250000, hasColor: true },
  { kode: 'P002', nama: 'Cat Plafon 2.5L', harga: 120000, hasColor: true },
  { kode: 'P003', nama: 'Cat Dasar / Primer 5L', harga: 180000, hasColor: true },
  { kode: 'B001', nama: 'Kuas Besar 3"', harga: 35000, hasColor: false }, // kuas: tanpa warna
];

let cart = [];

/* konfigurasi yang bisa kamu edit */
const logoSrc = 'assets/jotun.svg'; // path logo
const shopName = 'Jotun';
const shopAddress = 'Jl. Alamat Kamu No. X';
const shopPhone = 'Telp: 0812xxxxxxx';

/* inisialisasi */
document.addEventListener('DOMContentLoaded', () => {
  renderProductList();
  renderCart();

  document.getElementById('searchBox').addEventListener('input', filterProducts);
  document.getElementById('btnAddProduct').addEventListener('click', handleAddProduct);
  document.getElementById('btnPrint').addEventListener('click', printStruk);
});

/* render daftar produk */
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
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = '#ffffff';
      colorInput.id = `color-${p.kode}`;
      colorInput.title = 'Pilih warna';
      row.appendChild(colorInput);

      const btn = document.createElement('button');
      btn.className = 'primary'; btn.innerText = '+';
      btn.onclick = () => addToCart(p.kode, p.nama, p.harga, colorInput.value);
      row.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.className = 'primary'; btn.innerText = '+';
      btn.onclick = () => addToCart(p.kode, p.nama, p.harga, null);
      row.appendChild(btn);
    }

    container.appendChild(row);
  });
}

/* helper create element */
function el(tag, cls, txt){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(txt !== undefined) e.innerText = txt;
  return e;
}

/* filter */
function filterProducts(){
  const q = document.getElementById('searchBox').value.toLowerCase();
  document.querySelectorAll('#productList .product-row').forEach(r=>{
    const name = (r.querySelector('.name')?.innerText || '').toLowerCase();
    const sku = (r.querySelector('.sku')?.innerText || '').toLowerCase();
    r.style.display = (name.includes(q) || sku.includes(q)) ? '' : 'none';
  });
}

/* tambah produk baru */
function handleAddProduct(){
  const kode = document.getElementById('newKode').value.trim();
  const nama = document.getElementById('newNama').value.trim();
  const harga = parseInt(document.getElementById('newHarga').value,10);
  const hasColor = document.getElementById('newHasColor').checked;

  if(!kode || !nama || !harga || isNaN(harga) || harga <= 0) {
    return alert('Isi data produk dengan benar (kode, nama, harga angka > 0).');
  }
  if(PRODUCTS.some(p => p.kode.toLowerCase() === kode.toLowerCase())) {
    return alert('Kode sudah ada. Gunakan kode lain.');
  }

  PRODUCTS.push({ kode, nama, harga, hasColor });
  renderProductList();
  document.getElementById('newKode').value = '';
  document.getElementById('newNama').value = '';
  document.getElementById('newHarga').value = '';
  document.getElementById('newHasColor').checked = false;
}

/* keranjang */
function addToCart(kode, nama, harga, color){
  const existing = cart.find(i => i.kode === kode && (i.color || null) === (color || null));
  if(existing) existing.qty++;
  else cart.push({ kode, nama, harga, qty:1, color: color || null });
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

/* ===== build print-area (58mm thermal template) and print ===== */
function printStruk(){
  if(cart.length === 0) return alert('Keranjang masih kosong!');

  // remove existing print area
  const prev = document.getElementById('print-area');
  if(prev) prev.remove();

  const printArea = document.createElement('div');
  printArea.id = 'print-area';

  // create header with logo (if available) and shop info
  const now = new Date();
  const invoiceNo = 'INV-' + now.getTime();
  const created = now.toLocaleString();

  let logoHtml = '';
  if(logoSrc){
    // svg external; if browser blocks for file://, inline or use PNG
    logoHtml = `<div class="logo"><img src="${logoSrc}" alt="logo" style="max-width:120px; width:100%; height:auto;" /></div>`;
  }

  const header = `
    ${logoHtml}
    <div class="shop-name">${shopName}</div>
    <div class="shop-info">${shopAddress} — ${shopPhone}</div>
    <div style="height:6px"></div>
    <div style="text-align:center;font-size:11px;">No: ${invoiceNo} | ${created}</div>
    <div class="divider"></div>
  `;

  // items: align using monospace-ish blocks
  let itemsHtml = `<div class="items">`;
  cart.forEach(i=>{
    const total = i.qty * i.harga;
    // left: name + optional color + qty/harga small; right: total
    const colorLine = i.color ? `\nWarna: ${i.color}` : '';
    itemsHtml += `
      <div class="row">
        <div class="left">${i.nama}${colorLine}<div style="font-size:11px;color:#333">Qty: ${i.qty}  @ Rp ${i.harga.toLocaleString()}</div></div>
        <div class="right">Rp ${total.toLocaleString()}</div>
      </div>
    `;
  });
  itemsHtml += `</div>`;

  // subtotal
  const subtotal = cart.reduce((s,i)=> s + i.qty*i.harga, 0);
  const tot = `<div class="divider"></div>
    <div class="total"><div>Total</div><div>Rp ${subtotal.toLocaleString()}</div></div>
    <div class="divider"></div>
    <div class="thanks">Terima kasih — Selamat berbelanja!</div>
    <div style="height:8px"></div>
  `;

  printArea.innerHTML = header + itemsHtml + tot;
  document.body.appendChild(printArea);

  // call print dialog
  window.print();

  // cleanup after a short delay
  setTimeout(()=>{ printArea.remove(); }, 1200);
}
