/* npx json-server --watch db.json --port 3000 */

'use strict';

const API = 'http://localhost:3000';

const PEOPLE = [{
      name: 'Amr Yasser',
      img: './assets/images/Amr.jpg'
   },
   {
      name: 'Habiba Tarek',
      img: './assets/images/Habiba.jpg'
   },
   {
      name: 'Suzan Elbadry',
      img: './assets/images/Suzan.jpg'
   }
];

function getNextIndex() {
   try {
      const key = 'gratitude_index';
      const curr = Number(localStorage.getItem(key) || '-1');
      const next = (curr + 1) % PEOPLE.length;
      localStorage.setItem(key, String(next));
      return next;
   } catch {
      return Math.floor(Math.random() * PEOPLE.length);
   }
}

function renderGratitude() {
   const i = getNextIndex();
   const p = PEOPLE[i];
   const img = document.getElementById('gratitude-img');
   const name = document.getElementById('gratitude-name');
   if (!img || !name) return;
   img.src = p.img;
   img.alt = p.name;
   img.onerror = function () {
      this.style.display = 'none';
   };
   name.innerHTML = `<a href="team.html" target="_blank" rel="noopener noreferrer">${p.name}</a>`;
}

let categories = [];
let products = [];

const tabs = {
   products: document.getElementById('tab-products'),
   categories: document.getElementById('tab-categories'),
};
const wraps = {
   product: document.getElementById('products-form-wrap'),
   category: document.getElementById('categories-form-wrap'),
};

const productForm = document.getElementById('product-form');
const productId = document.getElementById('product-id');
const productName = document.getElementById('product-name');
const productPrice = document.getElementById('product-price');
const productQty = document.getElementById('product-qty');
const productCategory = document.getElementById('product-category');
const productImage = document.getElementById('product-image');
const productDesc = document.getElementById('product-desc');
const productMsg = document.getElementById('product-msg');
const productFormTitle = document.getElementById('product-form-title');

const categoryForm = document.getElementById('category-form');
const categoryId = document.getElementById('category-id');
const categoryName = document.getElementById('category-name');
const categoryDesc = document.getElementById('category-desc');
const categoryMsg = document.getElementById('category-msg');
const categoryFormTitle = document.getElementById('category-form-title');

const filterCategory = document.getElementById('filter-category');
const searchInput = document.getElementById('search');
const inventoryBody = document.getElementById('inventory-body');

const countProducts = document.getElementById('count-products');
const countCategories = document.getElementById('count-categories');

const statQty = document.getElementById('stat-total-qty');
const statVal = document.getElementById('stat-total-value');

const fmt = new Intl.NumberFormat('en-EG', {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2
});

function showMsg(el, text, type = 'success') {
   el.textContent = text;
   el.className = `msg ${type}`;
   el.style.display = 'inline-block';
   setTimeout(() => {
      el.style.display = 'none';
   }, 2200);
}

async function api(path, {
   method = 'GET',
   body = undefined,
   headers = {}
} = {}) {
   const opts = {
      method,
      headers: {
         ...headers
      }
   };
   if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
   }
   const url = `${API}${path}`;
   let res;
   try {
      res = await fetch(url, opts);
   } catch (e) {
      console.error('Fetch failed:', method, url, e);
      throw new Error('Network error: cannot reach API');
   }
   if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('API error:', method, url, res.status, res.statusText, txt);
      throw new Error(`${res.status} ${res.statusText}`);
   }
   if (res.status === 204) return {};
   const ctype = res.headers.get('content-type') || '';
   return ctype.includes('application/json') ? res.json() : res.text();
}

async function loadAll() {
   try {
      const [cats, prods] = await Promise.all([
         api('/categories').catch(e => {
            console.warn('cats load failed', e);
            return [];
         }),
         api('/products').catch(e => {
            console.warn('products load failed', e);
            return [];
         })
      ]);
      categories = Array.isArray(cats) ? cats : [];
      products = Array.isArray(prods) ? prods : [];
      hydrateUI();
   } catch (e) {
      console.error(e);
      alert('Could not load API. Make sure JSON Server is running on http://localhost:3000');
   }
}

function hydrateUI() {
   productCategory.innerHTML =
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
   filterCategory.innerHTML =
      `<option value="">All categories</option>` +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

   countProducts.textContent = `${products.length} products`;
   countCategories.textContent = `${categories.length} categories`;

   renderTable();
   refreshCustomSelects();
}

function renderTable() {
   const term = (searchInput.value || '').trim().toLowerCase();
   const theCat = filterCategory.value;

   const list = products.filter(p => {
      const okCat = !theCat || String(p.categoryId) === String(theCat);
      const okTerm = !term || [p.name, p.description].filter(Boolean)
         .some(s => String(s).toLowerCase().includes(term));
      return okCat && okTerm;
   });

   const catById = {};
   for (const c of categories) catById[c.id] = c;

   inventoryBody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img class="img-thumb" src="${p.image || ''}" alt="${p.name}" onerror="this.src=''; this.style.display='none'" />
          <div>
            <div style="font-weight:700;">${p.name}</div>
            <div class="hint">${p.description || ''}</div>
          </div>
        </div>
      </td>
      <td><span class="pill">${(catById[p.categoryId] && catById[p.categoryId].name) || '—'}</span></td>
      <td>EGP ${fmt.format(Number(p.price || 0))}</td>
      <td>${Number(p.quantity || 0)}</td>
      <td>EGP ${fmt.format(Number(p.price || 0) * Number(p.quantity || 0))}</td>
      <td>
        <div class="inline">
          <button class="btn" type="button" data-action="edit" data-id="${String(p.id)}">Edit</button>
          <button class="btn danger" type="button" data-action="delete" data-id="${String(p.id)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

   const totalQty = list.reduce((s, p) => s + Number(p.quantity || 0), 0);
   const totalVal = list.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
   statQty.textContent = totalQty;
   statVal.textContent = fmt.format(totalVal);
}

inventoryBody.addEventListener('click', (e) => {
   const btn = e.target.closest('button[data-action]');
   if (!btn) return;

   const action = btn.dataset.action;
   const idRaw = btn.dataset.id;
   const id = Number(idRaw);

   if (!idRaw || !Number.isFinite(id)) {
      console.warn('Invalid id on action button:', idRaw, btn);
      alert('Invalid item id.');
      return;
   }

   if (action === 'edit') {
      editProduct(id);
   } else if (action === 'delete') {
      deleteProduct(id);
   }
});

tabs.products.addEventListener('click', () => {
   tabs.products.classList.add('active');
   tabs.categories.classList.remove('active');
   wraps.product.style.display = '';
   wraps.category.style.display = 'none';
});
tabs.categories.addEventListener('click', () => {
   tabs.categories.classList.add('active');
   tabs.products.classList.remove('active');
   wraps.category.style.display = '';
   wraps.product.style.display = 'none';
});

searchInput.addEventListener('input', renderTable);
filterCategory.addEventListener('change', renderTable);

productForm.addEventListener('submit', async (e) => {
   e.preventDefault();
   const payload = {
      name: productName.value.trim(),
      description: productDesc.value.trim(),
      image: productImage.value.trim(),
      price: Number(productPrice.value),
      quantity: Number(productQty.value),
      categoryId: Number(productCategory.value)
   };
   try {
      if (!payload.name) throw new Error('Name is required');
      if (!Number.isFinite(payload.price)) throw new Error('Price must be a number');
      if (!Number.isFinite(payload.quantity)) throw new Error('Quantity must be a number');

      if (productId.value) {
         const id = Number(productId.value);
         const updated = await api(`/products/${id}`, {
            method: 'PATCH',
            body: payload
         });
         products = products.map(p => p.id === id ? {
            ...p,
            ...updated
         } : p);
         showMsg(productMsg, 'Product updated', 'success');
      } else {
         const created = await api('/products', {
            method: 'POST',
            body: payload
         });
         products.push(created);
         showMsg(productMsg, 'Product added', 'success');
      }
      resetProductForm();
      renderTable();
   } catch (err) {
      console.error('Save product failed:', err);
      showMsg(productMsg, err.message || 'Failed', 'error');
   }
});

document.getElementById('product-reset').addEventListener('click', resetProductForm);

function editProduct(id) {
   const p = products.find(x => Number(x.id) === Number(id));
   if (!p) {
      alert('Product not found');
      return;
   }
   productId.value = p.id;
   productName.value = p.name || '';
   productPrice.value = p.price ?? '';
   productQty.value = p.quantity ?? '';
   productCategory.value = p.categoryId ?? '';
   productImage.value = p.image || '';
   productDesc.value = p.description || '';
   productFormTitle.textContent = 'Edit Product';
   tabs.products.click();
   window.scrollTo({
      top: 0,
      behavior: 'smooth'
   });
}

async function deleteProduct(id) {
   const p = products.find(x => Number(x.id) === Number(id));
   if (!p) {
      alert('Product not found');
      return;
   }
   if (!confirm(`Delete product: ${p.name}?`)) return;
   try {
      await api(`/products/${id}`, {
         method: 'DELETE'
      });
      products = products.filter(x => Number(x.id) !== Number(id));
      renderTable();
   } catch (err) {
      console.error('Delete product failed:', err);
      alert('Failed to delete. Check console for details.');
   }
}

function resetProductForm() {
   productId.value = '';
   productForm.reset();
   productFormTitle.textContent = 'Add Product';
}

categoryForm.addEventListener('submit', async (e) => {
   e.preventDefault();
   const payload = {
      name: categoryName.value.trim(),
      description: categoryDesc.value.trim()
   };
   try {
      if (!payload.name) throw new Error('Name is required');

      if (categoryId.value) {
         const id = Number(categoryId.value);
         const updated = await api(`/categories/${id}`, {
            method: 'PATCH',
            body: payload
         });
         categories = categories.map(c => c.id === id ? {
            ...c,
            ...updated
         } : c);
         showMsg(categoryMsg, 'Category updated', 'success');
      } else {
         const created = await api('/categories', {
            method: 'POST',
            body: payload
         });
         categories.push(created);
         showMsg(categoryMsg, 'Category added', 'success');
      }
      hydrateUI();
      resetCategoryForm();
   } catch (err) {
      console.error('Save category failed:', err);
      showMsg(categoryMsg, err.message || 'Failed', 'error');
   }
});

document.getElementById('category-reset').addEventListener('click', resetCategoryForm);

function editCategory(id) {
   const c = categories.find(x => Number(x.id) === Number(id));
   if (!c) {
      alert('Category not found');
      return;
   }
   categoryId.value = c.id;
   categoryName.value = c.name || '';
   categoryDesc.value = c.description || '';
   categoryFormTitle.textContent = 'Edit Category';
   tabs.categories.click();
   window.scrollTo({
      top: 0,
      behavior: 'smooth'
   });
}

async function deleteCategory(id) {
   const c = categories.find(x => Number(x.id) === Number(id));
   if (!c) {
      alert('Category not found');
      return;
   }
   if (!confirm(`Delete category: ${c.name}? (Products linked to this category will keep the old categoryId)`)) return;
   try {
      await api(`/categories/${id}`, {
         method: 'DELETE'
      });
      categories = categories.filter(x => Number(x.id) !== Number(id));
      hydrateUI();
   } catch (err) {
      console.error('Delete category failed:', err);
      alert('Failed to delete category. Check console for details.');
   }
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

function resetCategoryForm() {
   categoryId.value = '';
   categoryForm.reset();
   categoryFormTitle.textContent = 'Add Category';
}

const nselectMap = new Map();

function refreshCustomSelects() {
   ensureNSelect(productCategory);
   ensureNSelect(filterCategory);
}

function ensureNSelect(nativeSelect, {
   rtl = false
} = {}) {
   if (!nativeSelect) return;
   const id = nativeSelect.id || Math.random().toString(36).slice(2);
   nativeSelect.id = id;

   if (nselectMap.has(id)) {
      nselectMap.get(id).rebuild();
      return nselectMap.get(id);
   }
   const ctl = enhanceSelect(nativeSelect, {
      rtl
   });
   nselectMap.set(id, ctl);
   return ctl;
}

function enhanceSelect(nativeSelect, {
   rtl = false
} = {}) {
   nativeSelect.classList.add('select--visually-hidden');

   const wrap = document.createElement('div');
   wrap.className = 'nselect' + (rtl ? ' is-rtl' : '');
   wrap.setAttribute('data-for', nativeSelect.id);

   const btn = document.createElement('button');
   btn.type = 'button';
   btn.className = 'nselect__btn';
   btn.setAttribute('aria-haspopup', 'listbox');
   btn.setAttribute('aria-expanded', 'false');

   const label = document.createElement('span');
   label.className = 'nselect__label';
   label.textContent = (nativeSelect.options[nativeSelect.selectedIndex] && nativeSelect.options[nativeSelect.selectedIndex].text) || '—';

   const arrow = document.createElement('span');
   arrow.className = 'nselect__arrow';

   btn.appendChild(label);
   btn.appendChild(arrow);

   const menu = document.createElement('div');
   menu.className = 'nselect__menu';
   menu.setAttribute('role', 'listbox');

   function buildOptions() {
      menu.innerHTML = '';
      for (let i = 0; i < nativeSelect.options.length; i++) {
         const opt = nativeSelect.options[i];
         const item = document.createElement('div');
         item.className = 'nselect__opt';
         item.setAttribute('role', 'option');
         item.setAttribute('data-value', opt.value);
         item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
         item.textContent = opt.text;
         item.addEventListener('click', () => choose(i));
         menu.appendChild(item);
      }
   }

   function open() {
      wrap.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      const sel = menu.querySelector('[aria-selected="true"]');
      if (sel) sel.scrollIntoView({
         block: 'nearest'
      });
      document.addEventListener('click', onOutside);
      document.addEventListener('keydown', onKey);
   }

   function close() {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutside);
      document.removeEventListener('keydown', onKey);
   }

   function toggle() {
      wrap.classList.contains('open') ? close() : open();
   }

   function onOutside(e) {
      if (!wrap.contains(e.target)) close();
   }

   function choose(index) {
      nativeSelect.selectedIndex = index;
      label.textContent = nativeSelect.options[index].text;
      const opts = menu.querySelectorAll('.nselect__opt');
      for (let i = 0; i < opts.length; i++) {
         opts[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
      }
      nativeSelect.dispatchEvent(new Event('change', {
         bubbles: true
      }));
      close();
   }

   function onKey(e) {
      const max = nativeSelect.options.length - 1;
      if (e.key === 'Escape') return close();
      if (e.key === 'Enter') return close();
      let i = nativeSelect.selectedIndex;
      if (e.key === 'ArrowDown') {
         e.preventDefault();
         i = Math.min(max, i + 1);
         choose(i);
         open();
      }
      if (e.key === 'ArrowUp') {
         e.preventDefault();
         i = Math.max(0, i - 1);
         choose(i);
         open();
      }
   }

   btn.addEventListener('click', toggle);

   nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
   wrap.appendChild(nativeSelect);
   wrap.appendChild(btn);
   wrap.appendChild(menu);


   nativeSelect.addEventListener('change', () => {
      const idx = nativeSelect.selectedIndex;
      if (idx >= 0) label.textContent = nativeSelect.options[idx].text;
      const opts = menu.querySelectorAll('.nselect__opt');
      for (let i = 0; i < opts.length; i++) {
         opts[i].setAttribute('aria-selected', i === idx ? 'true' : 'false');
      }
   });

   buildOptions();

   return {
      rebuild: buildOptions,
      destroy: () => {}
   };
}

renderGratitude();
loadAll();