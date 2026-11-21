'use strict';

const SAMPLE_ITEMS = [
    { name: 'Cooking oil 2L',   qty: 6,  price: 42.5, vat: 14 },
    { name: 'Maize meal 10kg',  qty: 4,  price: 68,   vat: 0  },
    { name: 'Soft drink 2L',    qty: 12, price: 12.5, vat: 14 }
];

const SAMPLE_HEADER = {
    supplier: 'Kgalagadi Wholesale',
    receipt:  'KW-10482',
    date:     '2026-11-20'
};

let items = structuredClone(SAMPLE_ITEMS);

const $ = (id) => document.getElementById(id);
const money = (n) => 'P ' + Number(n).toFixed(2);
const lineTotal = (x) => x.qty * x.price * (1 + x.vat / 100);

const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.hidden = false;
}

function hideToast() {
    $('toast').hidden = true;
} 

function hideToast() {
    $('toast').hidden = true;
}

function render() {
    $('rows').innerHTML = items.map((x, i) => `
    <tr>
        <td><input class="item" data-i="${i}" data-k="name" value="${escapeHtml(x.name)}" aria-label="Product ${i + 1} description"></td>
        <td><input type="number" min="0" step="1" data-i="${i}" data-k="qty" value="${x.qty}" aria-label="Product ${i + 1} quantity"></td>
        <td><input type="number" min="0" step="0.01" data-i="${i}" data-k="price" value="${x.price}" aria-label="Product ${i + 1} unit price"></td>
        <td><input type="number" min="0" max="100" step="0.1" data-i="${i}" data-k="vat" value="${x.vat}" aria-label="Product ${i + 1} VAT percent"></td>
        <td><b>${money(lineTotal(x))}</b></td>
        <td><button type="button" class="btn secondary" data-del="${i}" aria-label="Remove item ${i + 1}">×</button></td>
    </tr>`).join('');

    const subtotal = items.reduce((a, x) => a + x.qty * x.price, 0);
    const vat = items.reduce((a, x) => a + x.qty * x.price * x.vat / 100, 0);

    $('subtotal').textContent = money(subtotal);
    $('vat').textContent = money(vat);
    $('total').textContent = money(subtotal + vat);
    $('count').textContent = `${items.length} line item${items.length === 1 ? '' : 's'}`;
}

function loadSample() {
    items = structuredClone(SAMPLE_ITEMS);
    $('supplier').value = SAMPLE_HEADER.supplier;
    $('receipt').value = SAMPLE_HEADER.receipt;
    $('date').value = SAMPLE_HEADER.date;
    $('filename').textContent = 'sample-receipt.pdf';
    $('filesub').textContent = 'Sample receipt · simulated extraction';
    $('state').textContent = 'Sample data ready to review';
    render();
}

function exportCsv() {
    const headers = [
    'supplier', 'receipt_number', 'purchase_date', 'currency',
    'product', 'quantity', 'unit_price', 'vat_percent', 'line_total'
    ];

    const rows = items.map((x) => [
    $('supplier').value, $('receipt').value, $('date').value, $('currency').value,
    x.name, x.qty, x.price, x.vat, lineTotal(x).toFixed(2)
    ]);

    const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aeflik-verified-purchase.csv';
    link.click();
    URL.revokeObjectURL(url);

    showToast('CSV exported. This is a demo record; verify it against the original receipt before importing.');
}

// Editing and removing line items (event delegation)
$('rows').addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.i === undefined) return;
    const item = items[Number(t.dataset.i)];
    const key = t.dataset.k;
    item[key] = key === 'name' ? t.value : Math.max(0, Number(t.value) || 0);
    render();
});

$('rows').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    items.splice(Number(btn.dataset.del), 1);
    render();
});

// Toolbar actions
$('sample').addEventListener('click', loadSample);
$('add').addEventListener('click', () => {
    items.push({ name: 'New product', qty: 1, price: 0, vat: 0 });
    render();
});
$('reset').addEventListener('click', () => {
    loadSample();
    hideToast();
});
$('export').addEventListener('click', exportCsv);

// File selection (extraction is not connected in this demo)
$('browse').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    $('filename').textContent = file.name;
    $('filesub').textContent = `${(file.size / 1024).toFixed(0)} KB · selected locally`;
    $('state').textContent = 'File selected — extraction is not connected in this demo';
    showToast('This prototype does not read uploaded files yet. Use “Load sample receipt” to demonstrate the review and export flow.');
});

render();