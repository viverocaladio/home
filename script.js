const API_URL = "https://script.google.com/macros/s/AKfycbxx4ajNbyu-9dtWQi908jriYdlGBv4AoII-oYK5nThsB1WksLpa-OCEm5EvR2Amn2duYw/exec";

let isAdminLoggedIn = false;

let plantas = [
  { ID: "PLN-001", Nombre: "Algarrobo Blanco", Categoria: "Árboles y Forestales", Imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop", Precio: 15000, Stock: "Disponible" },
  { ID: "PLN-002", Nombre: "Jacarandá 10L", Categoria: "Árboles y Forestales", Imagen: "https://images.unsplash.com/photo-1599598425230-87a1236d9345?q=80&w=600&auto=format&fit=crop", Precio: 21000, Stock: "Disponible" },
  { ID: "PLN-003", Nombre: "Jazmín del País", Categoria: "Trepadoras y Enredaderas", Imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop", Precio: 10000, Stock: "Disponible" },
  { ID: "PLN-004", Nombre: "Limonero Sutil", Categoria: "Frutales y Cítricos", Imagen: "https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?q=80&w=600&auto=format&fit=crop", Precio: 25000, Stock: "Disponible" },
  { ID: "PLN-005", Nombre: "Palmera Pindó", Categoria: "Palmeras y Cycas", Imagen: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop", Precio: null, Stock: "Sin Stock" },
  { ID: "PLN-006", Nombre: "Monstera Deliciosa", Categoria: "Plantas de Interior y Tropicales", Imagen: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&auto=format&fit=crop", Precio: 20000, Stock: "Disponible" },
  { ID: "PLN-007", Nombre: "Lavanda Grande", Categoria: "Aromáticas y Medicinales", Imagen: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=600&auto=format&fit=crop", Precio: 7500, Stock: "Disponible" },
  { ID: "PLN-008", Nombre: "Maceta Ciotola N40", Categoria: "Macetas y Accesorios", Imagen: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop", Precio: 13050, Stock: "Disponible" }
];

let cart = [];
let remitoItems = [];
let presupuestoAdminItems = [];
let categories = [];
let currentSlide = 0;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  fetchPlants();
  updateCarousel();

  const savedToken = sessionStorage.getItem("adminToken");
  if (savedToken) {
    updateAdminUI(true);
  } else {
    updateAdminUI(false);
  }
});

function switchMobileTab(tab) {
  const catalogSec = document.getElementById("mobile-catalog-sec");
  const cartSec = document.getElementById("mobile-cart-sec");
  const tabBtnCatalog = document.getElementById("tab-btn-catalog");
  const tabBtnCart = document.getElementById("tab-btn-cart");
  const floatingBar = document.getElementById("mobile-floating-bar");

  if (tab === 'catalog') {
    cartSec.classList.add("opacity-0");
    setTimeout(() => {
      cartSec.classList.add("hidden");
      cartSec.classList.remove("flex");
      catalogSec.classList.remove("hidden");
      setTimeout(() => catalogSec.classList.remove("opacity-0"), 10);
    }, 150);

    tabBtnCatalog.className = "flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 border-brand-400 text-brand-300 flex items-center justify-center space-x-2 transition-all";
    tabBtnCart.className = "flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 border-transparent text-gray-400 flex items-center justify-center space-x-2 transition-all relative";

    if (cart.length > 0) {
      floatingBar.classList.remove("hidden");
    }
  } else if (tab === 'cart') {
    catalogSec.classList.add("opacity-0");
    setTimeout(() => {
      catalogSec.classList.add("hidden");
      cartSec.classList.remove("hidden");
      cartSec.classList.add("flex");
      setTimeout(() => cartSec.classList.remove("opacity-0"), 10);
    }, 150);

    tabBtnCart.className = "flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 border-brand-400 text-brand-300 flex items-center justify-center space-x-2 transition-all relative";
    tabBtnCatalog.className = "flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 border-transparent text-gray-400 flex items-center justify-center space-x-2 transition-all";

    floatingBar.classList.add("hidden");
  }
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateMobileFloatingBar() {
  const totalQty = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.Precio || 0) * item.cantidad), 0);

  const badge = document.getElementById("mobile-tab-badge");
  const floatingBar = document.getElementById("mobile-floating-bar");
  const floatingQty = document.getElementById("mobile-floating-qty");
  const floatingTotal = document.getElementById("mobile-floating-total");

  if (badge) {
    badge.innerText = totalQty;
    if (totalQty > 0) badge.classList.remove("hidden");
    else badge.classList.add("hidden");
  }

  if (floatingQty) floatingQty.innerText = totalQty;
  if (floatingTotal) floatingTotal.innerText = `$${totalPrice.toLocaleString('es-AR')}`;

  const catalogSec = document.getElementById("mobile-catalog-sec");
  if (floatingBar && catalogSec && !catalogSec.classList.contains("hidden")) {
    if (totalQty > 0) {
      floatingBar.classList.remove("hidden");
    } else {
      floatingBar.classList.add("hidden");
    }
  }
}

function updateAdminUI(loggedIn) {
  isAdminLoggedIn = loggedIn;
  const loginView = document.getElementById("admin-login-view");
  const crudView = document.getElementById("admin-crud-view");
  const btnPresupuesto = document.getElementById("nav-btn-presupuesto");
  const btnRemito = document.getElementById("nav-btn-remito");
  const btnPlantList = document.getElementById("nav-btn-plant-list");

  if (loggedIn) {
    if (loginView) loginView.classList.add("hidden");
    if (crudView) crudView.classList.remove("hidden");
    if (btnPresupuesto) btnPresupuesto.classList.remove("hidden");
    if (btnRemito) btnRemito.classList.remove("hidden");
    if (btnPlantList) btnPlantList.classList.remove("hidden");
  } else {
    if (loginView) loginView.classList.remove("hidden");
    if (crudView) crudView.classList.add("hidden");
    if (btnPresupuesto) btnPresupuesto.classList.add("hidden");
    if (btnRemito) btnRemito.classList.add("hidden");
    if (btnPlantList) btnPlantList.classList.add("hidden");
  }
}

async function submitAdminLogin() {
  const passInput = document.getElementById("admin-pass");
  const pass = passInput ? passInput.value : "";
  
  if (!pass) {
    alert("Por favor ingresa la contraseña.");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "login", password: pass })
    });
    
    const resData = await response.json();
    
    if (resData.result === "success") {
      sessionStorage.setItem("adminToken", resData.token);
      updateAdminUI(true);
      if (passInput) passInput.value = "";
      alert("¡Sesión iniciada correctamente!");
      closeAdminModal();
    } else {
      alert("Contraseña incorrecta: " + (resData.message || ""));
    }
  } catch (err) {
    console.error("Error en el login:", err);
    alert("Ocurrió un error al conectar con el servidor.");
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("adminToken");
  updateAdminUI(false);
  alert("Sesión cerrada.");
  closeAdminModal();
}

function showNotification(plantName) {
  const toast = document.getElementById("toast-notification");
  const desc = document.getElementById("toast-desc");
  if (desc) desc.innerText = `Se añadió "${plantName}" al presupuesto.`;
  
  toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
  }, 3000);
}

function updateCarousel() {
  const slides = document.getElementById("carousel-slides");
  const dots = document.querySelectorAll(".carousel-dot");
  if (slides) {
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  dots.forEach((dot, idx) => {
    if (idx === currentSlide) {
      dot.classList.remove("bg-white/40");
      dot.classList.add("bg-white", "w-6");
    } else {
      dot.classList.remove("bg-white", "w-6");
      dot.classList.add("bg-white/40");
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % 3;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + 3) % 3;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

async function fetchPlants() {
  try {
    if (API_URL && !API_URL.includes("TU_WEB_APP_URL")) {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        plantas = data;
      }
    }
  } catch (err) {
    console.warn("Usando catálogo base por defecto:", err);
  }
  populateCategories();
  renderPlantsGrid();
  populateRemitoSelect();
  populatePresupuestoAdminSelect();
}

function populateCategories() {
  const cats = [...new Set(plantas.map(p => p.Categoria))].filter(Boolean).sort();
  categories = cats;
  const select = document.getElementById("category-select");
  select.innerHTML = '<option value="TODAS">Todas las Categorías</option>' + 
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderPlantsGrid(itemsToRender = plantas) {
  const grid = document.getElementById("plants-grid");
  const noResults = document.getElementById("no-results");

  const availableItems = itemsToRender.filter(p => {
    return p.Precio !== null && p.Precio !== undefined && p.Precio !== "" && Number(p.Precio) > 0;
  });

  if (availableItems.length === 0) {
    grid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  grid.innerHTML = availableItems.map(p => {
    const precioFmt = `$${Number(p.Precio).toLocaleString('es-AR')}`;
    const defaultImg = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop";
    const plantImg = p.Imagen && p.Imagen.trim() !== "" ? p.Imagen : defaultImg;

    return `
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
    <div class="aspect-square w-full overflow-hidden bg-gray-100 relative">
      <img src="${plantImg}" alt="${p.Nombre}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      <span class="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white bg-brand-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">${p.Categoria || 'General'}</span>
    </div>
    
    <div class="p-4 flex flex-col justify-between flex-1">
      <div>
        <h4 class="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">${p.Nombre}</h4>
      </div>
      
      <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span class="text-base font-extrabold text-gray-900">${precioFmt}</span>
        <button onclick="addToCart('${p.ID}')" class="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm transition-transform active:scale-95">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Agregar</span>
        </button>
      </div>
    </div>
  </div>
`;
  }).join('');
  lucide.createIcons();
}

function filterPlants() {
  const search = document.getElementById("search-input").value.toLowerCase().trim();
  const cat = document.getElementById("category-select").value;

  const filtered = plantas.filter(p => {
    const matchesName = p.Nombre.toLowerCase().includes(search);
    const matchesCat = cat === "TODAS" || p.Categoria === cat;
    return matchesName && matchesCat;
  });

  renderPlantsGrid(filtered);
}

function addToCart(plantId) {
  const plant = plantas.find(p => p.ID === plantId);
  if (!plant) return;

  const hasPrice = plant.Precio !== null && plant.Precio !== undefined && plant.Precio !== "" && Number(plant.Precio) > 0;
  if (!hasPrice) return;

  const existingIndex = cart.findIndex(item => item.ID === plantId);
  if (existingIndex > -1) {
    cart[existingIndex].cantidad += 1;
  } else {
    cart.push({ ...plant, cantidad: 1 });
  }
  updateCartUI();
  updateMobileFloatingBar();
  showNotification(plant.Nombre);
}

function updateQuantity(plantId, change) {
  const index = cart.findIndex(item => item.ID === plantId);
  if (index > -1) {
    cart[index].cantidad += change;
    if (cart[index].cantidad <= 0) {
      cart.splice(index, 1);
    }
  }
  updateCartUI();
  updateMobileFloatingBar();
}

function removeFromCart(plantId) {
  cart = cart.filter(item => item.ID !== plantId);
  updateCartUI();
  updateMobileFloatingBar();
}

function clearCart() {
  cart = [];
  updateCartUI();
  updateMobileFloatingBar();
}

function updateCartUI() {
  const cartList = document.getElementById("cart-list");
  const emptyMsg = document.getElementById("empty-cart-msg");
  const badge = document.getElementById("cart-badge");
  
  const totalCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.Precio || 0) * item.cantidad), 0);

  if (totalCount > 0) {
    badge.innerText = totalCount;
    badge.classList.remove("hidden");
    emptyMsg.classList.add("hidden");
  } else {
    badge.classList.add("hidden");
    emptyMsg.classList.remove("hidden");
  }

  document.getElementById("cart-item-count").innerText = totalCount;
  document.getElementById("cart-total-price").innerText = `$${totalPrice.toLocaleString('es-AR')}`;

  cartList.innerHTML = cart.map(item => `
    <li class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
      <div class="pr-2 flex-1">
        <h5 class="font-bold text-gray-800">${item.Nombre}</h5>
        <span class="text-gray-500 font-semibold">$${Number(item.Precio || 0).toLocaleString('es-AR')} c/u</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
          <button onclick="updateQuantity('${item.ID}', -1)" class="text-gray-500 hover:text-red-600 font-bold px-1">-</button>
          <span class="font-bold text-gray-800 text-xs">${item.cantidad}</span>
          <button onclick="updateQuantity('${item.ID}', 1)" class="text-gray-500 hover:text-brand-600 font-bold px-1">+</button>
        </div>
        <button onclick="removeFromCart('${item.ID}')" class="text-red-500 hover:text-red-700 p-1.5 bg-white border border-gray-200 rounded-lg transition-colors" title="Eliminar planta">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </li>
  `).join('');
  lucide.createIcons();
}

function generatePDFBudget() {
  if (cart.length === 0) {
    alert("Agrega al menos una planta al presupuesto antes de generar el PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const clientName = document.getElementById("client-name").value || "Cliente Particular";
  const clientPhone = document.getElementById("client-phone").value || "No especificado";
  const today = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const budgetNum = "PRE-" + Math.floor(1000 + Math.random() * 9000);

  const primaryGreen = [37, 97, 60];
  const darkGreen = [14, 35, 23];
  const lightBg = [242, 249, 244];
  const textDark = [45, 55, 72];

  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VIVERO CALADIO", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 225, 195);
  doc.text("De José Luis Romero • Producción Propia y Asesoramiento", 14, 27);
  doc.text("ESTE DOCUMENTO NO ES VÁLIDO COMO FACTURA", 14, 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`PRESUPUESTO #${budgetNum}`, 196, 20, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 230, 210);
  doc.text(`Fecha: ${today}`, 196, 27, { align: 'right' });

  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 48, 88, 30, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text("DATOS DEL EMISOR", 18, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text("Av. Felix de la Colina (Acceso Sur) - La Rioja", 18, 60);
  doc.text("Cel: (380) 154387678", 18, 65);
  doc.text("CUIT: 23-16733906-9", 18, 70);

  doc.setFillColor(...lightBg);
  doc.roundedRect(108, 48, 88, 30, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text("PREPARADO PARA", 112, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(clientName, 112, 61);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Teléfono: ${clientPhone}`, 112, 67);

  const tableData = cart.map((item, idx) => {
    const totalItem = Number(item.Precio || 0) * item.cantidad;
    return [
      idx + 1,
      item.Nombre,
      item.Categoria || 'General',
      item.cantidad,
      `$ ${Number(item.Precio || 0).toLocaleString('es-AR')}`,
      `$ ${totalItem.toLocaleString('es-AR')}`
    ];
  });

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.Precio || 0) * item.cantidad), 0);

  doc.autoTable({
    startY: 84,
    head: [['#', 'Especie / Descripción', 'Categoría', 'Cant.', 'P. Unitario', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: primaryGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'left', cellWidth: 40 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 32 }
    },
    alternateRowStyles: { fillColor: [248, 252, 249] },
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: textDark },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...primaryGreen);
  doc.roundedRect(110, finalY, 86, 16, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL ESTIMADO", 114, finalY + 10);
  doc.setFontSize(12);
  doc.text(`$ ${subtotal.toLocaleString('es-AR')}`, 190, finalY + 10, { align: 'right' });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("• Precios sujetos a modificación según disponibilidad de stock en cultivo.", 14, finalY + 28);
  doc.text("• Validez de esta cotización: 15 días desde la fecha de emisión.", 14, finalY + 33);
  doc.text("¡Gracias por elegir Vivero Caladio para verdear tus espacios!", 14, finalY + 38);

  doc.save(`Presupuesto_Vivero_Caladio_${budgetNum}.pdf`);
}

function openPresupuestoAdminModal() {
  if (!isAdminLoggedIn) return;
  populatePresupuestoAdminSelect();
  renderPresupuestoAdminItemsTable();
  const modal = document.getElementById("presupuesto-admin-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closePresupuestoAdminModal() {
  const modal = document.getElementById("presupuesto-admin-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function populatePresupuestoAdminSelect() {
  const select = document.getElementById("presupuesto-admin-plant-select");
  const addBtn = document.getElementById("presupuesto-admin-add-btn");
  if (!select) return;
  
  select.innerHTML = plantas.map(p => {
    const hasPrice = p.Precio !== null && p.Precio !== undefined && p.Precio !== "" && Number(p.Precio) > 0;
    const statusText = hasPrice ? `$${Number(p.Precio).toLocaleString('es-AR')}` : "Sin Stock";
    return `<option value="${p.ID}" data-hasprice="${hasPrice}">${p.Nombre} - ${statusText}</option>`;
  }).join('');

  const checkSelectedPlant = () => {
    const selectedOpt = select.options[select.selectedIndex];
    const isAvailable = selectedOpt && selectedOpt.getAttribute("data-hasprice") === "true";
    if (addBtn) {
      if (!isAvailable) {
        addBtn.disabled = true;
        addBtn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        addBtn.disabled = false;
        addBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  };

  select.onchange = checkSelectedPlant;
  checkSelectedPlant();
}

function addPlantToPresupuestoAdmin() {
  const select = document.getElementById("presupuesto-admin-plant-select");
  const plantId = select.value;
  const qtyInput = document.getElementById("presupuesto-admin-plant-qty");
  const cantidad = parseInt(qtyInput.value) || 1;

  const plant = plantas.find(p => p.ID === plantId);
  if (!plant) return;

  const hasPrice = plant.Precio !== null && plant.Precio !== undefined && plant.Precio !== "" && Number(plant.Precio) > 0;
  if (!hasPrice) return;

  const existingIndex = presupuestoAdminItems.findIndex(i => i.ID === plantId);
  if (existingIndex > -1) {
    presupuestoAdminItems[existingIndex].cantidad += cantidad;
  } else {
    presupuestoAdminItems.push({
      ID: plant.ID,
      Nombre: plant.Nombre,
      Categoria: plant.Categoria,
      Precio: plant.Precio,
      cantidad: cantidad
    });
  }

  renderPresupuestoAdminItemsTable();
}

function updatePresupuestoAdminItemQty(index, newQty) {
  const qty = parseInt(newQty);
  if (isNaN(qty) || qty <= 0) {
    presupuestoAdminItems.splice(index, 1);
  } else {
    presupuestoAdminItems[index].cantidad = qty;
  }
  renderPresupuestoAdminItemsTable();
}

function removePresupuestoAdminItem(index) {
  presupuestoAdminItems.splice(index, 1);
  renderPresupuestoAdminItemsTable();
}

function clearPresupuestoAdminItems() {
  presupuestoAdminItems = [];
  renderPresupuestoAdminItemsTable();
}

function renderPresupuestoAdminItemsTable() {
  const tbody = document.getElementById("presupuesto-admin-items-tbody");
  const emptyMsg = document.getElementById("presupuesto-admin-empty-msg");
  const subtotalEl = document.getElementById("presupuesto-admin-subtotal-price");
  const ivaAmountEl = document.getElementById("presupuesto-admin-iva-amount");
  const totalPriceEl = document.getElementById("presupuesto-admin-total-price");

  if (presupuestoAdminItems.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    subtotalEl.innerText = "$0";
    ivaAmountEl.innerText = "$0";
    totalPriceEl.innerText = "$0";
    return;
  }

  emptyMsg.classList.add("hidden");
  let subtotal = 0;

  tbody.innerHTML = presupuestoAdminItems.map((item, idx) => {
    const itemSubtotal = Number(item.Precio || 0) * item.cantidad;
    subtotal += itemSubtotal;
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-semibold text-gray-800">${item.Nombre}</td>
        <td class="p-3 text-center">
          <input type="number" min="1" value="${item.cantidad}" onchange="updatePresupuestoAdminItemQty(${idx}, this.value)" class="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-emerald-500 outline-none bg-white font-bold">
        </td>
        <td class="p-3 text-right text-gray-600">$${Number(item.Precio || 0).toLocaleString('es-AR')}</td>
        <td class="p-3 text-right font-bold text-gray-900">$${itemSubtotal.toLocaleString('es-AR')}</td>
        <td class="p-3 text-center">
          <button onclick="removePresupuestoAdminItem(${idx})" class="text-red-500 hover:text-red-700 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const ivaChecked = document.getElementById("presupuesto-admin-iva-check") ? document.getElementById("presupuesto-admin-iva-check").checked : false;
  const ivaAmount = ivaChecked ? subtotal * 0.21 : 0;
  const total = subtotal + ivaAmount;

  subtotalEl.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  ivaAmountEl.innerText = `$${ivaAmount.toLocaleString('es-AR')}`;
  totalPriceEl.innerText = `$${total.toLocaleString('es-AR')}`;
  
  lucide.createIcons();
}

function generatePDFPresupuestoAdmin() {
  if (presupuestoAdminItems.length === 0) {
    alert("Agrega al menos una planta al presupuesto antes de generar el PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const clientName = document.getElementById("presupuesto-admin-client-name").value || "Cliente Particular";
  const clientPhone = document.getElementById("presupuesto-admin-client-phone").value || "No especificado";
  const today = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const budgetNum = "PRE-" + Math.floor(1000 + Math.random() * 9000);

  const primaryGreen = [37, 97, 60];
  const darkGreen = [14, 35, 23];
  const lightBg = [242, 249, 244];
  const textDark = [45, 55, 72];

  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VIVERO CALADIO", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 225, 195);
  doc.text("De José Luis Romero • Producción Propia y Asesoramiento", 14, 27);
  doc.text("ESTE DOCUMENTO NO ES VÁLIDO COMO FACTURA", 14, 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`PRESUPUESTO #${budgetNum}`, 196, 20, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 230, 210);
  doc.text(`Fecha: ${today}`, 196, 27, { align: 'right' });

  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 48, 88, 30, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text("DATOS DEL EMISOR", 18, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text("Av. Felix de la Colina (Acceso Sur) - La Rioja", 18, 60);
  doc.text("Cel: (380) 154387678", 18, 65);
  doc.text("CUIT: 23-16733906-9", 18, 70);

  doc.setFillColor(...lightBg);
  doc.roundedRect(108, 48, 88, 30, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text("PREPARADO PARA", 112, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(clientName, 112, 61);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Teléfono: ${clientPhone}`, 112, 67);

  const tableData = presupuestoAdminItems.map((item, idx) => {
    const totalItem = Number(item.Precio || 0) * item.cantidad;
    return [
      idx + 1,
      item.Nombre,
      item.Categoria || 'General',
      item.cantidad,
      `$ ${Number(item.Precio || 0).toLocaleString('es-AR')}`,
      `$ ${totalItem.toLocaleString('es-AR')}`
    ];
  });

  const subtotal = presupuestoAdminItems.reduce((sum, item) => sum + (Number(item.Precio || 0) * item.cantidad), 0);
  const ivaChecked = document.getElementById("presupuesto-admin-iva-check") ? document.getElementById("presupuesto-admin-iva-check").checked : false;
  const ivaAmount = ivaChecked ? subtotal * 0.21 : 0;
  const totalCalculated = subtotal + ivaAmount;

  doc.autoTable({
    startY: 84,
    head: [['#', 'Especie / Descripción', 'Categoría', 'Cant.', 'P. Unitario', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: primaryGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'left', cellWidth: 40 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 32 }
    },
    alternateRowStyles: { fillColor: [248, 252, 249] },
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: textDark },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  let boxHeight = 16;
  if (ivaChecked) boxHeight = 24;

  doc.setFillColor(...primaryGreen);
  doc.roundedRect(110, finalY, 86, boxHeight, 3, 3, 'F');

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);

  if (ivaChecked) {
    doc.text("Subtotal:", 114, finalY + 6);
    doc.text(`$ ${subtotal.toLocaleString('es-AR')}`, 190, finalY + 6, { align: 'right' });

    doc.text("IVA (21%):", 114, finalY + 11);
    doc.text(`$ ${ivaAmount.toLocaleString('es-AR')}`, 190, finalY + 11, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL ESTIMADO", 114, finalY + 18);
    doc.setFontSize(11);
    doc.text(`$ ${totalCalculated.toLocaleString('es-AR')}`, 190, finalY + 18, { align: 'right' });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL ESTIMADO", 114, finalY + 10);
    doc.setFontSize(12);
    doc.text(`$ ${totalCalculated.toLocaleString('es-AR')}`, 190, finalY + 10, { align: 'right' });
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("• Precios sujetos a modificación según disponibilidad de stock en cultivo.", 14, finalY + boxHeight + 12);
  doc.text("• Validez de esta cotización: 15 días desde la fecha de emisión.", 14, finalY + boxHeight + 17);
  doc.text("¡Gracias por elegir Vivero Caladio para verdear tus espacios!", 14, finalY + boxHeight + 22);

  doc.save(`Presupuesto_Vivero_Caladio_${budgetNum}.pdf`);
}

function openRemitoModal() {
  if (!isAdminLoggedIn) return;
  populateRemitoSelect();
  renderRemitoItemsTable();
  const modal = document.getElementById("remito-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closeRemitoModal() {
  const modal = document.getElementById("remito-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function populateRemitoSelect() {
  const select = document.getElementById("remito-plant-select");
  const addBtn = document.getElementById("remito-add-btn");
  if (!select) return;
  
  select.innerHTML = plantas.map(p => {
    const hasPrice = p.Precio !== null && p.Precio !== undefined && p.Precio !== "" && Number(p.Precio) > 0;
    const statusText = hasPrice ? `$${Number(p.Precio).toLocaleString('es-AR')}` : "Sin Stock";
    return `<option value="${p.ID}" data-hasprice="${hasPrice}">${p.Nombre} - ${statusText}</option>`;
  }).join('');

  const checkSelectedPlant = () => {
    const selectedOpt = select.options[select.selectedIndex];
    const isAvailable = selectedOpt && selectedOpt.getAttribute("data-hasprice") === "true";
    if (addBtn) {
      if (!isAvailable) {
        addBtn.disabled = true;
        addBtn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        addBtn.disabled = false;
        addBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  };

  select.onchange = checkSelectedPlant;
  checkSelectedPlant();
}

function addPlantToRemito() {
  const select = document.getElementById("remito-plant-select");
  const plantId = select.value;
  const qtyInput = document.getElementById("remito-plant-qty");
  const cantidad = parseInt(qtyInput.value) || 1;

  const plant = plantas.find(p => p.ID === plantId);
  if (!plant) return;

  const hasPrice = plant.Precio !== null && plant.Precio !== undefined && plant.Precio !== "" && Number(plant.Precio) > 0;
  if (!hasPrice) return;

  const existingIndex = remitoItems.findIndex(i => i.ID === plantId);
  if (existingIndex > -1) {
    remitoItems[existingIndex].cantidad += cantidad;
  } else {
    remitoItems.push({
      ID: plant.ID,
      Nombre: plant.Nombre,
      Categoria: plant.Categoria,
      Precio: plant.Precio,
      cantidad: cantidad
    });
  }

  renderRemitoItemsTable();
}

function updateRemitoItemQty(index, newQty) {
  const qty = parseInt(newQty);
  if (isNaN(qty) || qty <= 0) {
    remitoItems.splice(index, 1);
  } else {
    remitoItems[index].cantidad = qty;
  }
  renderRemitoItemsTable();
}

function removeRemitoItem(index) {
  remitoItems.splice(index, 1);
  renderRemitoItemsTable();
}

function clearRemitoItems() {
  remitoItems = [];
  renderRemitoItemsTable();
}

function renderRemitoItemsTable() {
  const tbody = document.getElementById("remito-items-tbody");
  const emptyMsg = document.getElementById("remito-empty-msg");
  const subtotalEl = document.getElementById("remito-subtotal-price");
  const ivaAmountEl = document.getElementById("remito-iva-amount");
  const totalPriceEl = document.getElementById("remito-total-price");

  if (remitoItems.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    subtotalEl.innerText = "$0";
    ivaAmountEl.innerText = "$0";
    totalPriceEl.innerText = "$0";
    return;
  }

  emptyMsg.classList.add("hidden");
  let subtotal = 0;

  tbody.innerHTML = remitoItems.map((item, idx) => {
    const itemSubtotal = Number(item.Precio || 0) * item.cantidad;
    subtotal += itemSubtotal;
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-semibold text-gray-800">${item.Nombre}</td>
        <td class="p-3 text-center">
          <input type="number" min="1" value="${item.cantidad}" onchange="updateRemitoItemQty(${idx}, this.value)" class="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-amber-500 outline-none bg-white font-bold">
        </td>
        <td class="p-3 text-right text-gray-600">$${Number(item.Precio || 0).toLocaleString('es-AR')}</td>
        <td class="p-3 text-right font-bold text-gray-900">$${itemSubtotal.toLocaleString('es-AR')}</td>
        <td class="p-3 text-center">
          <button onclick="removeRemitoItem(${idx})" class="text-red-500 hover:text-red-700 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const ivaChecked = document.getElementById("remito-iva-check") ? document.getElementById("remito-iva-check").checked : false;
  const ivaAmount = ivaChecked ? subtotal * 0.21 : 0;
  const total = subtotal + ivaAmount;

  subtotalEl.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  ivaAmountEl.innerText = `$${ivaAmount.toLocaleString('es-AR')}`;
  totalPriceEl.innerText = `$${total.toLocaleString('es-AR')}`;
  
  lucide.createIcons();
}

function generatePDFRemito() {
  if (remitoItems.length === 0) {
    alert("Agrega al menos una planta al remito antes de generar el PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const clientName = document.getElementById("remito-client-name").value || "Cliente Particular";
  const clientPhone = document.getElementById("remito-client-phone").value || "No especificado";
  const clientAddress = document.getElementById("remito-client-address").value || "Retira en Vivero";
  const today = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const remitoNum = "REM-" + Math.floor(1000 + Math.random() * 9000);

  const primaryColor = [180, 120, 20];
  const darkColor = [14, 35, 23];
  const lightBg = [254, 251, 246];
  const textDark = [45, 55, 72];

  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VIVERO CALADIO", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 200, 150);
  doc.text("De José Luis Romero • Producción Propia y Asesoramiento", 14, 27);
  doc.text("REMITO DE SALIDA / ENTREGA DE MERCADERÍA", 14, 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`REMITO #${remitoNum}`, 196, 20, { align: 'right' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(230, 200, 150);
  doc.text(`Fecha: ${today}`, 196, 27, { align: 'right' });

  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 48, 88, 32, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("DATOS DEL EMISOR", 18, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text("Av. Felix de la Colina (Acceso Sur) - La Rioja", 18, 60);
  doc.text("Cel: (380) 154387678", 18, 65);
  doc.text("CUIT: 23-16733906-9", 18, 70);

  doc.setFillColor(...lightBg);
  doc.roundedRect(108, 48, 88, 32, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("DESTINATARIO / ENTREGA", 112, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text(clientName, 112, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Tel: ${clientPhone} | Dir: ${clientAddress}`, 112, 66, { maxWidth: 80 });

  const tableData = remitoItems.map((item, idx) => {
    const totalItem = Number(item.Precio || 0) * item.cantidad;
    return [
      idx + 1,
      item.Nombre,
      item.Categoria || 'General',
      item.cantidad,
      `$ ${Number(item.Precio || 0).toLocaleString('es-AR')}`,
      `$ ${totalItem.toLocaleString('es-AR')}`
    ];
  });

  const subtotal = remitoItems.reduce((sum, item) => sum + (Number(item.Precio || 0) * item.cantidad), 0);
  const ivaChecked = document.getElementById("remito-iva-check") ? document.getElementById("remito-iva-check").checked : false;
  const ivaAmount = ivaChecked ? subtotal * 0.21 : 0;
  const totalCalculated = subtotal + ivaAmount;

  doc.autoTable({
    startY: 85,
    head: [['#', 'Especie / Descripción', 'Categoría', 'Cant.', 'P. Unitario', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'left', cellWidth: 40 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 32 }
    },
    alternateRowStyles: { fillColor: [254, 252, 248] },
    styles: { fontSize: 8.5, cellPadding: 3.5, textColor: textDark },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  let boxHeight = 16;
  if (ivaChecked) boxHeight = 24;

  doc.setFillColor(...primaryColor);
  doc.roundedRect(110, finalY, 86, boxHeight, 3, 3, 'F');

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);

  if (ivaChecked) {
    doc.text("Subtotal:", 114, finalY + 6);
    doc.text(`$ ${subtotal.toLocaleString('es-AR')}`, 190, finalY + 6, { align: 'right' });

    doc.text("IVA (21%):", 114, finalY + 11);
    doc.text(`$ ${ivaAmount.toLocaleString('es-AR')}`, 190, finalY + 11, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL REMITO", 114, finalY + 18);
    doc.setFontSize(11);
    doc.text(`$ ${totalCalculated.toLocaleString('es-AR')}`, 190, finalY + 18, { align: 'right' });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL REMITO", 114, finalY + 10);
    doc.setFontSize(12);
    doc.text(`$ ${totalCalculated.toLocaleString('es-AR')}`, 190, finalY + 10, { align: 'right' });
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("• La mercadería viaja por cuenta y orden del comprador.", 14, finalY + boxHeight + 12);
  doc.text("• Conforme de recepción: ___________________________", 14, finalY + boxHeight + 20);

  doc.save(`Remito_Vivero_Caladio_${remitoNum}.pdf`);
}

function openCatalogModal() {
  const modal = document.getElementById("catalog-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closeCatalogModal() {
  const modal = document.getElementById("catalog-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function openAdminModal() {
  const modal = document.getElementById("admin-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closeAdminModal() {
  const modal = document.getElementById("admin-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function openPlantListModal() {
  if (!isAdminLoggedIn) return;
  generateNextPlantID();
  populateAdminCategoryDropdown();
  renderAdminPlantsTable();
  const modal = document.getElementById("plant-list-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function generateNextPlantID() {
  const idInput = document.getElementById("new-plant-id");
  if (!idInput) return;

  if (!plantas || plantas.length === 0) {
    idInput.value = "PLN-001";
    return;
  }

  const numbers = plantas.map(p => {
    const match = p.ID && p.ID.match(/PLN-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });

  const maxNum = Math.max(...numbers, 0);
  const nextNum = maxNum + 1;
  idInput.value = `PLN-${String(nextNum).padStart(3, '0')}`;
}

function populateAdminCategoryDropdown() {
  const catSelect = document.getElementById("new-plant-cat");
  if (!catSelect) return;

  const cats = [...new Set(plantas.map(p => p.Categoria))].filter(Boolean).sort();
  catSelect.innerHTML = '<option value="">Seleccionar Categoría...</option>' + 
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function closePlantListModal() {
  const modal = document.getElementById("plant-list-modal");
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function renderAdminPlantsTable(itemsToRender = plantas) {
  const tbody = document.getElementById("admin-plants-tbody");
  if (!tbody) return;

  tbody.innerHTML = itemsToRender.map((p) => {
    const realIdx = plantas.findIndex(item => item.ID === p.ID);
    const precioVal = p.Precio !== null && p.Precio !== undefined && p.Precio !== "" ? p.Precio : "";
    
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-mono font-bold text-gray-500">${p.ID}</td>
        <td class="p-3">
          <input type="text" value="${p.Nombre}" id="admin-name-${realIdx}" class="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:border-brand-500 outline-none">
        </td>
        <td class="p-3">
          <input type="text" value="${p.Categoria || ''}" id="admin-cat-${realIdx}" class="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:border-brand-500 outline-none">
        </td>
        <td class="p-3">
          <input type="number" value="${precioVal}" id="admin-price-${realIdx}" placeholder="Sin precio" class="w-24 px-2 py-1 border border-gray-200 rounded text-xs bg-white focus:border-brand-500 outline-none font-bold">
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center space-x-2">
            <button onclick="savePlantRow(${realIdx})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
              Guardar
            </button>
            <button onclick="deletePlant('${p.ID}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Eliminar planta">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  lucide.createIcons();
}

function filterAdminPlants() {
  const search = document.getElementById("admin-search-input").value.toLowerCase().trim();
  const filtered = plantas.filter(p => p.Nombre.toLowerCase().includes(search) || p.ID.toLowerCase().includes(search));
  renderAdminPlantsTable(filtered);
}

function scrollToSection(event, sectionId) {
  event.preventDefault();
  const section = document.getElementById(sectionId);
  if (section) {
    const navHeight = 80; 
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}

async function savePlantRow(idx) {
  if (!isAdminLoggedIn) {
    alert("Acceso no autorizado.");
    return;
  }
  const plant = plantas[idx];
  const newName = document.getElementById(`admin-name-${idx}`).value.trim();
  const newCat = document.getElementById(`admin-cat-${idx}`).value.trim();
  const rawPrice = document.getElementById(`admin-price-${idx}`).value;
  const newPrice = rawPrice !== "" && !isNaN(parseFloat(rawPrice)) ? parseFloat(rawPrice) : null;

  if (!newName) {
    alert("Por favor ingresa un nombre válido.");
    return;
  }

  plant.Nombre = newName;
  plant.Categoria = newCat;
  plant.Precio = newPrice;
  plant.Stock = newPrice !== null ? "Disponible" : "Sin Stock";

  populateCategories();
  renderPlantsGrid();
  filterAdminPlants();
  populateRemitoSelect();
  populatePresupuestoAdminSelect();

  const sessionToken = sessionStorage.getItem("adminToken") || "";

  try {
    if (API_URL && !API_URL.includes("TU_WEB_APP_URL")) {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update", 
          token: sessionToken,
          ID: plant.ID, 
          Nombre: newName, 
          Categoria: newCat, 
          Imagen: plant.Imagen || "", 
          Precio: newPrice, 
          Stock: plant.Stock 
        })
      });
    }
    alert(`Planta "${newName}" actualizada y sincronizada correctamente.`);
  } catch (err) {
    console.error("Error al sincronizar:", err);
    alert("Se actualizó localmente, pero hubo un error al sincronizar con Google Sheets.");
  }
}

async function deletePlant(plantId) {
  if (!isAdminLoggedIn) {
    alert("Acceso no autorizado.");
    return;
  }
  const plant = plantas.find(p => p.ID === plantId);
  if (!plant) return;

  if (!confirm(`¿Estás seguro de que deseas eliminar la planta "${plant.Nombre}" (ID: ${plant.ID})?`)) {
    return;
  }

  plantas = plantas.filter(p => p.ID !== plantId);
  populateCategories();
  renderPlantsGrid();
  filterAdminPlants();
  populateRemitoSelect();
  populatePresupuestoAdminSelect();

  const sessionToken = sessionStorage.getItem("adminToken") || "";

  try {
    if (API_URL && !API_URL.includes("TU_WEB_APP_URL")) {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "delete", 
          token: sessionToken,
          ID: plantId 
        })
      });
    }
    alert("Planta eliminada con éxito.");
  } catch (err) {
    console.error("Error al eliminar en Google Sheets:", err);
    alert("Se eliminó localmente, pero hubo un error al sincronizar con Google Sheets.");
  }
}

async function addNewPlant() {
  if (!isAdminLoggedIn) {
    alert("Acceso no autorizado.");
    return;
  }

  const idInput = document.getElementById("new-plant-id");
  const nameInput = document.getElementById("new-plant-name");
  const catInput = document.getElementById("new-plant-cat");
  const priceInput = document.getElementById("new-plant-price");
  const imgInput = document.getElementById("new-plant-img"); // Por si el HTML aún lo tiene oculto o disponible

  const newId = idInput ? idInput.value.trim() : "";
  const newName = nameInput ? nameInput.value.trim() : "";
  const newCat = catInput ? catInput.value.trim() : "General";
  const rawPrice = priceInput ? priceInput.value.trim() : "";
  const newPrice = rawPrice !== "" && !isNaN(parseFloat(rawPrice)) ? parseFloat(rawPrice) : null;
  const newImg = imgInput ? imgInput.value.trim() : "";

  if (!newId || !newName || !newCat) {
    alert("Por favor completa el ID, el Nombre y selecciona una Categoría.");
    return;
  }

  const exists = plantas.some(p => p.ID === newId);
  if (exists) {
    alert("Ya existe una planta con el ID ingresado.");
    return;
  }

  const newPlantObj = {
    ID: newId,
    Nombre: newName,
    Categoria: newCat,
    Imagen: newImg,
    Precio: newPrice,
    Stock: newPrice !== null ? "Disponible" : "Sin Stock"
  };

  plantas.push(newPlantObj);

  if (nameInput) nameInput.value = "";
  if (priceInput) priceInput.value = "";
  if (catInput) catInput.value = "";
  if (imgInput) imgInput.value = "";

  generateNextPlantID();
  populateCategories();
  renderPlantsGrid();
  renderAdminPlantsTable();
  populateRemitoSelect();
  populatePresupuestoAdminSelect();

  const sessionToken = sessionStorage.getItem("adminToken") || "";

  try {
    if (API_URL && !API_URL.includes("TU_WEB_APP_URL")) {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "create", 
          token: sessionToken,
          ...newPlantObj 
        })
      });
    }
    alert(`¡Planta "${newName}" agregada con éxito con el ID ${newId}!`);
  } catch (err) {
    console.error("Error al crear en Google Sheets:", err);
    alert("Se agregó localmente, pero hubo un error al sincronizar con Google Sheets.");
  }
}