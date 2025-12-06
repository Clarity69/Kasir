/* script.js: Kasir Toko Cat dengan template invoice-struk */

const PRODUCTS = [
  { kode: 'P001', nama: 'Cat Dinding 5L (Premium)', harga: 250000, hasColor: true },
  { kode: 'P002', nama: 'Cat Plafon 2.5L', harga: 120000, hasColor: true },
  { kode: 'P003', nama: 'Cat Dasar / Primer 5L', harga: 180000, hasColor: true },
  { kode: 'B001', nama: 'Kuas Besar 3"', harga: 35000, hasColor: false },
];

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  renderProductList();
  renderCart();

  document.getElementById('searchBox').addEventListener('input', filterProducts);
  document.getElementById('btnAddProduct').addEventListener('click', handleAddProduct);
  document.getElementById('btnPrint').addEventListener('click', printInvoice);
});

/* Render produk */
function renderProductList(){
  const container = document.getElementById('productList');
  container.innerHTML = '';
  PRODUCTS.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-row';
    div.id = `prod-${p.kode}`;

    const sku = el('div','sku',p.kode);
    const name = el('div','name',p.nama);
    const meta = el('div','meta',`Rp ${p.harga.toLocaleString()}`);
    div.appendChild(sku); div.appendChild(name); div.appendChild(meta);

    if(p.hasColor){
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = '#ffffff';
      colorInput.id = `color-${p.kode}`;
      colorInput.title = 'Pilih warna';
      div.appendChild(colorInput);

      const btn = document.createElement('button');
      btn.className = 'primary';
      btn.innerText = '+';
      btn.onclick = () => addToCart(p.kode, p.nama, p.harga, colorInput.value);
      div.appendChild(btn);
    } else {
      // hanya tombol tambah untuk produk tanpa warna
      const btn = document.createElement('button');
      btn.className = 'primary';
      btn.innerText = '+';
      btn.onclick = () => addToCart(p.kode, p.nama, p.harga, null);
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
}

/* helper */
function el(tag, cls, txt){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(txt !== undefined) e.innerText = txt;
  return e;
}

/* filter */
function filterProducts(){
  const q = document.getElementById('searchBox').value.toLowerCase();
  const rows = document.querySelectorAll('#productList .product-row');
  rows.forEach(r=>{
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

  if(!kode || !nama || !harga || isNaN(harga) || harga <= 0){
    return alert('Isi data produk dengan benar (kode, nama, harga angka > 0).');
  }

  if(PRODUCTS.some(p => p.kode.toLowerCase() === kode.toLowerCase())){
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
  const val = parseInt(el.value) || 0;
  const item = cart.find(i => i.kode === kode && (i.color || null) === (color || null));
  if(!item) return;
  item.qty = val;
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

  if(cart.length === 0){
    box.innerHTML = '<div class="muted">Keranjang kosong.</div>';
  }

  cart.forEach(item => {
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

    const input = document.createElement('input'); input.type = 'number'; input.min = '1'; input.value = item.qty;
    input.onchange = function(){ updateQty(item.kode, item.color, this); };

    const del = document.createElement('button'); del.className = 'danger'; del.innerText = '✕';
    del.onclick = () => removeItem(item.kode, item.color);

    right.appendChild(input); right.appendChild(del);

    wrapper.appendChild(left); wrapper.appendChild(right);
    box.appendChild(wrapper);
  });

  document.getElementById('subtotalValue').innerText = "Rp " + subtotal.toLocaleString();
  document.getElementById('totalValue').innerText = "Rp " + subtotal.toLocaleString();
}

/* Build invoice-like print area and call window.print() */
function printInvoice(){
  if(cart.length === 0) return alert('Keranjang masih kosong!');

  // hapus jika sudah ada
  const prev = document.getElementById('print-area');
  if(prev) prev.remove();

  const printArea = document.createElement('div');
  printArea.id = 'print-area';
  printArea.className = 'invoice-box';

  // header data toko & invoice meta
  const invoiceNo = 'INV-' + Date.now();
  const now = new Date();
  const created = now.toLocaleString();
  const due = new Date(now.getTime() + 7*24*60*60*1000).toLocaleDateString(); // due +7 hari

  // kamu bisa ganti logoSrc ke path logo yang ada, atau hilangkan tag <img> jika tidak perlu
  const logoSrc = ''; // contoh: './images/logo.png' -> kosong = tidak tampil

  let headerHtml = `
    <table>
      <tr class="top">
        <td colspan="2">
          <table>
            <tr>
              <td class="title">
                ${ logoSrc ? `<img src="${logoSrc}" alt="logo" />` : `<div style="font-size:20px;font-weight:700;color:#333">TOKO CAT & PERLENGKAPAN</div>` }
              </td>
              <td style="text-align:right">
                Invoice #: ${invoiceNo}<br/>
                Created: ${created}<br/>
                Due: ${due}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr class="information">
        <td colspan="2">
          <table>
            <tr>
              <td>
                Nama Toko<br/>
                Jl. Contoh No.1<br/>
                Telp: 0812xxxxxxx
              </td>

              <td style="text-align:right">
                Pelanggan<br/>
                — <br/>
                —
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  // items
  let itemsHtml = `
    <table>
      <tr class="heading">
        <td>Item</td>
        <td style="text-align:right">Price</td>
      </tr>
  `;

  let subtotal = 0;
  cart.forEach(i=>{
    const lineTotal = i.qty * i.harga;
    subtotal += lineTotal;

    const colorLine = i.color ? `<div style="font-size:12px;color:#555">Warna: ${i.color}</div>` : '';
    itemsHtml += `
      <tr class="item">
        <td>
          ${i.nama} ${colorLine}
          <div style="font-size:12px;color:#777">Qty: ${i.qty} — Rp ${i.harga.toLocaleString()}</div>
        </td>
        <td style="text-align:right">Rp ${lineTotal.toLocaleString()}</td>
      </tr>
    `;
  });

  itemsHtml += `
      <tr class="total">
        <td></td>
        <td style="text-align:right">Total: Rp ${subtotal.toLocaleString()}</td>
      </tr>
    </table>
  `;

  const footer = `
    <div style="height:10px"></div>
    <div style="text-align:center;font-size:13px;color:#333">Terima kasih — Selamat berbelanja!</div>
  `;

  printArea.innerHTML = headerHtml + itemsHtml + footer;
  document.body.appendChild(printArea);

  // panggil print dialog
  window.print();

  // bersihkan elemen setelah delay
  setTimeout(()=>{ printArea.remove(); }, 1000);
}
