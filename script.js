let products = [
 {id:1,name:"ক্যাজুয়াল টি-শার্ট",category:"ফ্যাশন",price:450,emoji:"👕",desc:"প্রতিদিনের আরামদায়ক পোশাক",tag:"জনপ্রিয়"},
 {id:2,name:"ওয়্যারলেস হেডফোন",category:"ইলেকট্রনিক্স",price:1250,emoji:"🎧",desc:"গান ও কলের জন্য",tag:"নতুন"},
 {id:3,name:"স্পোর্টস স্নিকার্স",category:"ফ্যাশন",price:1890,emoji:"👟",desc:"হালকা ও আরামদায়ক",tag:""},
 {id:4,name:"স্কিন কেয়ার সেট",category:"সৌন্দর্য",price:790,emoji:"🧴",desc:"দৈনন্দিন যত্নের জন্য",tag:""},
 {id:5,name:"স্মার্ট ঘড়ি",category:"ইলেকট্রনিক্স",price:2150,emoji:"⌚",desc:"স্টাইল ও স্মার্ট ফিচার",tag:"জনপ্রিয়"},
 {id:6,name:"কফি মগ",category:"ঘর ও রান্নাঘর",price:280,emoji:"☕",desc:"আপনার পছন্দের পানীয়ের জন্য",tag:""},
 {id:7,name:"ব্যাকপ্যাক",category:"লাইফস্টাইল",price:990,emoji:"🎒",desc:"কাজ, পড়াশোনা ও ভ্রমণে",tag:""},
 {id:8,name:"সানগ্লাস",category:"ফ্যাশন",price:550,emoji:"🕶️",desc:"স্মার্ট লুকের অনুষঙ্গ",tag:""}
];
let cart = JSON.parse(localStorage.getItem("prio19_cart") || "[]");
let activeCategory = "সব";
const $ = id => document.getElementById(id);
const money = n => "৳" + Number(n).toLocaleString("en-US");
function saveCart(){localStorage.setItem("prio19_cart",JSON.stringify(cart));renderCart();updateCount();}
function updateCount(){$("cartCount").textContent=cart.reduce((sum,item)=>sum+item.qty,0);}
function renderProducts(){
 const query=$("searchInput").value.trim().toLowerCase();
 const filtered=products.filter(p=>(activeCategory==="সব"||p.category===activeCategory)&&(p.name.toLowerCase().includes(query)||p.category.toLowerCase().includes(query)||p.desc.toLowerCase().includes(query)));
 $("resultCount").textContent=filtered.length+"টি পণ্য";
 $("productGrid").innerHTML=filtered.length?filtered.map(p=>`<article class="product-card"><div class="product-art">${p.image_url?`<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain">`:`<span>${p.emoji||"🛍️"}</span>`}${p.tag?`<span class="product-tag">${p.tag}</span>`:""}</div><h3>${p.name}</h3><p class="product-desc">${p.description||p.desc||""}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${p.id}">＋ কার্টে</button></div></article>`).join(""):`<div class="empty">কোনো পণ্য পাওয়া যায়নি। অন্য নামে খুঁজুন।</div>`;
}
function renderCart(){
 const items=$("cartItems");
 if(!cart.length){items.innerHTML='<div class="empty">🛒<br>আপনার কার্ট এখনো খালি।</div>';}
 else items.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);return `<div class="cart-row"><div class="cart-emoji">${p.emoji}</div><div><h4>${p.name}</h4><small>${money(p.price)} × ${item.qty}</small><div class="qty"><button data-qty="-1" data-id="${p.id}">−</button><b>${item.qty}</b><button data-qty="1" data-id="${p.id}">＋</button></div></div><button class="remove" data-remove="${p.id}">মুছুন</button></div>`}).join("");
 $("cartTotal").textContent=money(cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0));
}
function openCart(){$("overlay").classList.remove("hidden");$("cartDrawer").classList.add("open");}
function closePanels(){$("overlay").classList.add("hidden");$("cartDrawer").classList.remove("open");$("checkoutModal").classList.add("hidden");}
let toastTimer;function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);}
$("productGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(!btn)return;const id=Number(btn.dataset.add);const item=cart.find(x=>x.id===id);item?item.qty++:cart.push({id,qty:1});saveCart();toast("পণ্যটি কার্টে যোগ হয়েছে");});
$("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(r)cart=cart.filter(x=>x.id!==Number(r.dataset.remove));if(q){const item=cart.find(x=>x.id===Number(q.dataset.id));item.qty+=Number(q.dataset.qty);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id);}saveCart();});
$("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll("[data-category]").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
$("searchForm").addEventListener("submit",e=>{e.preventDefault();renderProducts();});
$("searchInput").addEventListener("input",renderProducts);
$("cartOpen").addEventListener("click",openCart);$("cartClose").addEventListener("click",closePanels);$("overlay").addEventListener("click",closePanels);
$("checkoutOpen").addEventListener("click",()=>{if(!cart.length){toast("আগে কার্টে পণ্য যোগ করুন");return;}closePanels();$("checkoutModal").classList.remove("hidden");$("overlay").classList.remove("hidden");});
$("checkoutClose").addEventListener("click",closePanels);
$("checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();if(!cart.length)return;
 const data=new FormData(e.target);const orderId="P19-"+Date.now().toString().slice(-7);
 const lines=cart.map(item=>{const p=products.find(x=>x.id===item.id);return `${p.name} × ${item.qty} = ${money(p.price*item.qty)}`;}).join("\n");
 const total=cart.reduce((s,item)=>s+products.find(p=>p.id===item.id).price*item.qty,0);
 const message=`Prio 19ツ - নতুন অর্ডার\nঅর্ডার: ${orderId}\nনাম: ${data.get("customer")}\nফোন: ${data.get("phone")}\nঠিকানা: ${data.get("address")}\nপেমেন্ট: ${data.get("payment")}\n\nপণ্য:\n${lines}\n\nমোট: ${money(total)}\n\nনোট: অনলাইন পেমেন্ট নির্বাচন করলে পেমেন্ট গেটওয়ে সেটআপ না হওয়া পর্যন্ত টাকা পাঠাবেন না।`;
 closePanels();toast("অর্ডারের বিবরণ তৈরি হয়েছে");
 // Replace 9665XXXXXXXX with the shop's WhatsApp number in script.js before publishing.
 const shopWhatsApp="9665XXXXXXXX";
 if(!shopWhatsApp.includes("X")){window.open("https://wa.me/"+shopWhatsApp+"?text="+encodeURIComponent(message),"_blank");}
 else {const blob=new Blob([message],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=orderId+".txt";a.click();URL.revokeObjectURL(a.href);alert("অর্ডারের বিবরণ ফাইল হিসেবে সেভ হয়েছে। লাইভ অর্ডার পেতে script.js-এ আপনার WhatsApp নম্বর বসান।");}
 cart=[];saveCart();e.target.reset();
});
$("year").textContent=new Date().getFullYear();renderProducts();renderCart();updateCount();
(async function loadStoreProducts(){
 try{
  const db=window.supabase.createClient("https://ecofcxvsqoqostiaoovw.supabase.co","sb_publishable_qqG2hvIe19FC5Tohtj62sA_vvjasLSN");
  const {data,error}=await db.from("products").select("id,name,category,price,description,image_url,stock,active").eq("active",true).order("created_at",{ascending:false});
  if(error) throw error;
  products=(data||[]).map(p=>({...p,id:String(p.id),price:Number(p.price),emoji:"🛍️",desc:p.description||"",tag:""}));
  renderProducts();renderCart();updateCount();
 }catch(err){console.error("Supabase product loading error:",err);$("productGrid").innerHTML='<div class="empty">পণ্য লোড করা যায়নি। ডেটাবেসের অনুমতি পরীক্ষা করুন।</div>';$("resultCount").textContent="";}
})();
