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