export type InvoiceItem={name:string;quantity:number;unitPrice:number};
export type InvoicePayload={
 merchant:{name:string;address?:string};
 invoiceNumber?:string;date?:string;currency?:string;
 items:InvoiceItem[];tax?:{rate?:number};discount?:{rate?:number};
 payment?:{method?:string;last4?:string};note?:string;
};
const symbols:Record<string,string>={EUR:"€",USD:"$",GBP:"£",MAD:"MAD "};
export function money(n:number,c="EUR"){const s=symbols[c]??c+" ";return c==="MAD"?s+n.toFixed(2):s+n.toFixed(2)}
export function totals(r:InvoicePayload){const subtotal=r.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0);const discount=subtotal*((r.discount?.rate??0)/100);const taxable=Math.max(0,subtotal-discount);const tax=taxable*((r.tax?.rate??0)/100);return{subtotal,discount,tax,total:taxable+tax}}
export function validateInvoice(v:any):string|null{
 if(!v||typeof v!=="object")return"JSON body is required.";
 if(!v.merchant?.name)return"merchant.name is required.";
 if(!Array.isArray(v.items)||!v.items.length)return"items must contain at least one item.";
 for(const item of v.items){if(!item.name||typeof item.quantity!=="number"||typeof item.unitPrice!=="number")return"Each item requires name, numeric quantity and numeric unitPrice."}
 return null;
}
function esc(v:unknown){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]!))}
export function invoiceHtml(r:InvoicePayload){
 const c=r.currency??"EUR",t=totals(r);
 const rows=r.items.map(i=>`<div class="item"><div><b>${esc(i.name)}</b><small>${i.quantity} × ${money(i.unitPrice,c)}</small></div><b>${money(i.quantity*i.unitPrice,c)}</b></div>`).join("");
 return `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Arial,sans-serif;color:#201d19}.invoice{width:360px;margin:30px auto;background:#fffaf3;padding:30px 26px}.center{text-align:center}.center h1{font-size:23px;margin:0 0 7px}.center p{white-space:pre-line;color:#716a62;font-size:12px}.dash{border-top:1px dashed #999;margin:18px 0}.meta,.sum{display:grid;grid-template-columns:1fr auto;gap:8px;font-size:12px}.items{display:grid;gap:15px}.item{display:flex;justify-content:space-between;gap:15px;font-size:12px}.item div{display:grid;gap:4px}.item small{color:#777}.total{font-size:18px;border-top:2px solid #222;padding-top:10px;margin-top:4px}.foot{text-align:center;margin-top:24px;font-size:12px;color:#666}</style></head><body><main class="invoice"><section class="center"><h1>${esc(r.merchant.name)}</h1><p>${esc(r.merchant.address)}</p></section><div class="dash"></div><div class="meta"><span>Invoice</span><b>${esc(r.invoiceNumber??"RECEIPT")}</b><span>Date</span><b>${esc(r.date??new Date().toISOString().slice(0,10))}</b><span>Payment</span><b>${esc(r.payment?.method??"—")}${r.payment?.last4?" •••• "+esc(r.payment.last4):""}</b></div><div class="dash"></div><section class="items">${rows}</section><div class="dash"></div><section class="sum"><span>Subtotal</span><b>${money(t.subtotal,c)}</b>${t.discount?`<span>Discount</span><b>-${money(t.discount,c)}</b>`:""}${t.tax?`<span>Tax</span><b>${money(t.tax,c)}</b>`:""}<span class="total">Total</span><b class="total">${money(t.total,c)}</b></section><div class="foot">${esc(r.note??"Thank you for your purchase!")}</div></main></body></html>`;
}
