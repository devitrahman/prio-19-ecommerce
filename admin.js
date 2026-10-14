/* Prio 19 Admin Preview
 * IMPORTANT: LocalStorage demo only. Never use this as production authentication/database.
 */
const starterProducts = [
 {id:1,name:"ক্যাজুয়াল টি-শার্ট",category:"ফ্যাশন",price:450,stock:12,emoji:"👕",desc:"প্রতিদিনের আরামদায়ক পোশাক"},
 {id:2,name:"ওয়্যারলেস হেডফোন",category:"ইলেকট্রনিক্স",price:1250,stock:8,emoji:"🎧",desc:"গান ও কলের জন্য"},
 {id:3,name:"স্পোর্টস স্নিকার্স",category:"ফ্যাশন",price:1890,stock:5,emoji:"👟",desc:"হালকা ও আরামদায়ক"},
 {id:4,name:"স্কিন কেয়ার সেট",category:"সৌন্দর্য",price:790,stock:10,emoji:"🧴",desc:"দৈনন্দিন যত্নের জন্য"},
 {id:5,name:"স্মার্ট ঘড়ি",category:"ইলেকট্রনিক্স",price:2150,stock:4,emoji:"⌚",desc:"স্টাইল ও স্মার্ট ফিচার"},
 {id:6,name:"কফি মগ",category:"ঘর ও রান্নাঘর",price:280,stock:20,emoji:"☕",desc:"আপনার পছন্দের পানীয়ের জন্য"},
 {id:7,name:"ব্যাকপ্যাক",category:"লাইফস্টাইল",price:990,stock:7,emoji:"🎒",desc:"কাজ, পড়াশোনা ও ভ্রমণে"},
 {id:8,name:"সানগ্লাস",category:"ফ্যাশন",price:550,stock:9,emoji:"🕶️",desc:"স্মার্ট লুকের অনুষঙ্গ"}
];
const STORAGE_KEY = "prio19_admin_products_demo";
const $ = id => document.getElementById(id);
let products = loadProducts();
function loadProducts(){
 try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : starterProducts.map(p=>({...p})); }
 catch { return starterProducts.map(p=>({...p})); }
}
function saveProducts(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); render(); }
function money(value){return "৳"+Number(value).toLocaleString("en-US");}
function safeText(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const q=$("filter").value.trim().toLocaleLowerCase();
 const shown=products.filter(p=>[p.name,p.category,p.desc].join(" ").toLocaleLowerCase().includes(q));
 $("totalProducts").textContent=products.length;
 $("inStockProducts").textContent=products.filter(p=>Number(p.stock)>0).length;
 $("productRows").innerHTML=shown.map(p=>'<tr><td><div class="product-name"><span class="product-emoji">'+safeText(p.emoji||"📦")+'</span><span>'+safeText(p.name)+'</span></div></td><td>'+safeText(p.category)+'</td><td>'+money(p.price)+'</td><td><span class="stock-pill '+(Number(p.stock)===0?'out':'')+'">'+(Number(p.stock)===0?'স্টক শেষ':safeText(p.stock)+' টি')+'</span></td><td><div class="row-actions"><button class="small-btn" data-edit="'+p.id+'">সম্পাদনা</button><button class="small-btn delete" data-delete="'+p.id+'">মুছুন</button></div></td></tr>').join("");
 $("emptyState").classList.toggle("hidden",shown.length!==0);
}
function resetForm(){
 $("productForm").reset(); $("productId").value=""; $("formTitle").textContent="নতুন পণ্য যোগ করুন"; $("saveBtn").textContent="পণ্য যোগ করুন"; $("cancelEdit").classList.add("hidden");
}
$("productForm").addEventListener("submit",event=>{
 event.preventDefault();
 const id=$("productId").value;
 const item={id:id?Number(id):Date.now(),name:$("name").value.trim(),category:$("category").value.trim(),price:Number($("price").value),stock:Number($("stock").value),emoji:$("emoji").value.trim()||"📦",desc:$("desc").value.trim()};
 if(!item.name||!item.category||item.price<0||item.stock<0)return;
 if(id)products=products.map(p=>p.id===Number(id)?item:p);else products.unshift(item);
 saveProducts();resetForm();
});
$("productRows").addEventListener("click",event=>{
 const edit=event.target.closest("[data-edit]"); const del=event.target.closest("[data-delete]");
 if(edit){const p=products.find(x=>x.id===Number(edit.dataset.edit));if(!p)return;
  $("productId").value=p.id;$("name").value=p.name;$("category").value=p.category;$("price").value=p.price;$("stock").value=p.stock;$("emoji").value=p.emoji||"";$("desc").value=p.desc||"";
  $("formTitle").textContent="পণ্য সম্পাদনা করুন";$("saveBtn").textContent="পরিবর্তন সংরক্ষণ";$("cancelEdit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
 }
 if(del){const p=products.find(x=>x.id===Number(del.dataset.delete));if(p&&confirm('“'+p.name+'” পণ্যটি ডেমো তালিকা থেকে মুছবেন?')){products=products.filter(x=>x.id!==p.id);saveProducts();if($("productId").value===String(p.id))resetForm();}}
});
$("cancelEdit").addEventListener("click",resetForm);
$("filter").addEventListener("input",render);
$("resetDemo").addEventListener("click",()=>{if(confirm("ডেমো পণ্যের তালিকা আগের অবস্থায় ফিরিয়ে আনবেন?")){products=starterProducts.map(p=>({...p}));saveProducts();resetForm();}});
render();
