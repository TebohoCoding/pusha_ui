(function () {
  const data = window.PUSHA_MOCK_DATA;
  const routeIds = ["dashboard", "leads", "clients", "pipeline", "tasks", "settings"];
  const state = {
    route: routeIds.includes(location.hash.slice(1)) ? location.hash.slice(1) : "login",
    sidebarOpen: false,
    loading: false,
    selectedLead: null,
    selectedClient: null,
    leadQuery: "",
    leadStatus: "All",
    deals: [...data.deals],
  };

  const routes = [
    { id: "dashboard", label: "Dashboard", icon: "01" },
    { id: "leads", label: "Leads", icon: "02" },
    { id: "clients", label: "Clients", icon: "03" },
    { id: "pipeline", label: "Pipeline", icon: "04" },
    { id: "tasks", label: "Tasks", icon: "05" },
    { id: "settings", label: "Settings", icon: "06" },
  ];
  const stages = ["New", "Contacted", "Proposal", "Negotiation", "Won"];
  const app = document.querySelector("#app");

  const currency = (value) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(value);
  const number = (value) => new Intl.NumberFormat("en-US").format(value);
  const html = (strings, ...values) =>
    strings.reduce((result, string, index) => result + string + (values[index] ?? ""), "");
  const statusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

  function setRoute(route) {
    state.route = route;
    if (route === "login") {
      history.replaceState(null, "", location.pathname);
    } else if (location.hash.slice(1) !== route) {
      history.pushState(null, "", `#${route}`);
    }
    state.sidebarOpen = false;
    state.loading = route !== "login";
    render();
    if (state.loading) {
      window.setTimeout(() => {
        state.loading = false;
        render();
        requestAnimationFrame(animateCounters);
      }, 380);
    }
  }

  function render() {
    if (state.route === "login") {
      app.innerHTML = renderLogin();
      bindEvents();
      return;
    }
    app.innerHTML = html`
      <div class="shell ${state.sidebarOpen ? "nav-open" : ""}">
        ${renderSidebar()}
        <main class="workspace">
          ${renderTopbar()}
          <section class="page-frame">
            ${state.loading ? renderSkeleton() : renderPage()}
          </section>
        </main>
      </div>
      ${state.selectedLead ? renderLeadDrawer(state.selectedLead) : ""}
      ${state.selectedClient ? renderClientModal(state.selectedClient) : ""}
    `;
    bindEvents();
  }

  function renderLogin() {
    return html`
      <main class="login-page">
        <section class="login-brand">
          <div class="brand-mark">P</div>
          <p class="eyebrow">Premium pipeline control</p>
          <h1>Move every relationship forward with Pusha CRM.</h1>
          <p>
            A focused workspace for leads, deals, clients, and follow-ups. Built for teams that
            want momentum without the noise.
          </p>
          <div class="login-proof">
            <span>1248 leads tracked</span>
            <span>R1.84M pipeline</span>
            <span>19 follow-ups due</span>
          </div>
        </section>
        <section class="login-card" aria-label="Login form">
          <div>
            <p class="eyebrow">Welcome back</p>
            <h2>Sign in to Pusha CRM</h2>
          </div>
          <label>Email<input type="email" value="nandi@pusha.crm" aria-label="Email" /></label>
          <label>Password<input type="password" value="pusha-demo" aria-label="Password" /></label>
          <button class="button primary" data-login>Enter dashboard</button>
          <p class="helper-text">Demo mode uses local mock data only.</p>
        </section>
      </main>
    `;
  }

  function renderSidebar() {
    return html`
      <aside class="sidebar">
        <div class="sidebar-head">
          <div class="brand-mark small">P</div>
          <div><strong>Pusha CRM</strong><span>Sales command</span></div>
        </div>
        <nav class="nav-list" aria-label="Main navigation">
          ${routes
            .map(
              (route) => html`
                <button class="nav-item ${state.route === route.id ? "active" : ""}" data-route="${route.id}">
                  <span>${route.icon}</span>${route.label}
                </button>
              `,
            )
            .join("")}
        </nav>
        <div class="sidebar-card">
          <p>Pipeline focus</p>
          <strong>R1.84M</strong>
          <span>Weighted revenue this quarter</span>
        </div>
      </aside>
      <button class="scrim" data-close-nav aria-label="Close navigation"></button>
    `;
  }

  function renderTopbar() {
    const title = routes.find((route) => route.id === state.route)?.label || "Dashboard";
    return html`
      <header class="topbar">
        <button class="icon-button mobile-menu" data-toggle-nav aria-label="Open navigation">Menu</button>
        <div><p class="eyebrow">Pusha CRM</p><h1>${title}</h1></div>
        <label class="global-search"><span>Search</span><input type="search" placeholder="Search leads, clients, deals" /></label>
        <div class="profile">
          <img src="${data.user.avatar}" alt="${data.user.name}" />
          <div><strong>${data.user.name}</strong><span>${data.user.role}</span></div>
        </div>
      </header>
    `;
  }

  function renderSkeleton() {
    return html`<div class="skeleton-grid">${Array.from({ length: 8 }).map(() => '<div class="skeleton-card"></div>').join("")}</div>`;
  }

  function renderPage() {
    return {
      dashboard: renderDashboard,
      leads: renderLeads,
      clients: renderClients,
      pipeline: renderPipeline,
      tasks: renderTasks,
      settings: renderSettings,
    }[state.route]();
  }

  function renderDashboard() {
    const maxLead = Math.max(...data.chart.map((item) => item.leads));
    const maxDeal = Math.max(...data.chart.map((item) => item.deals));
    return html`
      <div class="page-grid dashboard-grid">
        <section class="kpi-row">
          ${data.metrics
            .map(
              (metric) => html`
                <article class="card kpi-card">
                  <span>${metric.label}</span>
                  <strong data-counter="${metric.value}" data-prefix="${metric.prefix || ""}">0</strong>
                  <small class="${metric.tone}">${metric.change}</small>
                </article>
              `,
            )
            .join("")}
        </section>
        <section class="card chart-card">
          <div class="section-head">
            <div><p class="eyebrow">Momentum</p><h2>Weekly performance</h2></div>
            <span class="pill">Live demo</span>
          </div>
          <div class="bar-chart" aria-label="Weekly leads and deals chart">
            ${data.chart
              .map(
                (item) => html`
                  <div class="bar-group">
                    <div class="bars">
                      <span style="height:${(item.leads / maxLead) * 100}%"></span>
                      <span style="height:${(item.deals / maxDeal) * 100}%"></span>
                    </div>
                    <small>${item.label}</small>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="card activity-card">
          <div class="section-head"><h2>Recent activity</h2></div>
          ${data.activity
            .map(
              (item) => html`
                <div class="activity-row">
                  <span></span><p><strong>${item.actor}</strong> ${item.action}</p><small>${item.time}</small>
                </div>
              `,
            )
            .join("")}
        </section>
        <section class="card tasks-card">
          <div class="section-head"><h2>Upcoming tasks</h2><button class="text-button" data-route="tasks">View all</button></div>
          ${data.tasks
            .slice(0, 4)
            .map(
              (task) => html`
                <div class="dashboard-task-row">
                  <input type="checkbox" ${task.done ? "checked" : ""} aria-label="${task.title}" />
                  <div><strong>${task.title}</strong><span>${task.owner} - ${task.due}</span></div>
                  <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
              `,
            )
            .join("")}
        </section>
      </div>
    `;
  }

  function renderLeads() {
    const statuses = ["All", ...new Set(data.leads.map((lead) => lead.status))];
    const query = state.leadQuery.toLowerCase();
    const leads = data.leads.filter((lead) => {
      const matchesQuery = [lead.name, lead.contact, lead.email, lead.source].join(" ").toLowerCase().includes(query);
      const matchesStatus = state.leadStatus === "All" || lead.status === state.leadStatus;
      return matchesQuery && matchesStatus;
    });
    return html`
      <div class="page-stack">
        <section class="toolbar">
          <label class="search-field">Search leads<input data-lead-search type="search" value="${state.leadQuery}" placeholder="Company, contact, source" /></label>
          <label class="select-field">Status<select data-lead-status>
            ${statuses.map((status) => `<option ${status === state.leadStatus ? "selected" : ""}>${status}</option>`).join("")}
          </select></label>
          <button class="button primary">Add Lead</button>
        </section>
        <section class="card table-card">
          <div class="lead-table">
            <div class="table-head"><span>Company</span><span>Contact</span><span>Source</span><span>Value</span><span>Status</span></div>
            ${leads
              .map(
                (lead) => html`
                  <button class="table-row" data-lead-id="${lead.id}">
                    <span><strong>${lead.name}</strong><small>${lead.owner}</small></span>
                    <span>${lead.contact}<small>${lead.email}</small></span>
                    <span>${lead.source}</span>
                    <span>${currency(lead.value)}</span>
                    <span class="status ${statusClass(lead.status)}">${lead.status}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  function renderClients() {
    return html`
      <div class="client-grid">
        ${data.clients
          .map(
            (client) => html`
              <article class="card client-card" data-client-id="${client.id}">
                <img src="${client.image}" alt="${client.name} workspace" />
                <div class="client-body">
                  <span class="status ${statusClass(client.status)}">${client.status}</span>
                  <h2>${client.name}</h2>
                  <p>${client.industry} - ${client.contact}</p>
                  <a href="mailto:${client.email}">${client.email}</a>
                  <div class="health"><span style="width:${client.health}%"></span></div>
                  <small>${client.health}% relationship health</small>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderPipeline() {
    return html`
      <section class="kanban" aria-label="Deals pipeline">
        ${stages
          .map((stage) => {
            const deals = state.deals.filter((deal) => deal.stage === stage);
            return html`
              <div class="kanban-column" data-stage="${stage}">
                <div class="kanban-head"><h2>${stage}</h2><span>${deals.length}</span></div>
                ${deals
                  .map(
                    (deal) => html`
                      <article class="deal-card" draggable="true" data-deal-id="${deal.id}">
                        <strong>${deal.title}</strong>
                        <span>${deal.company}</span>
                        <div><small>${deal.owner}</small><b>${currency(deal.value)}</b></div>
                      </article>
                    `,
                  )
                  .join("")}
              </div>
            `;
          })
          .join("")}
      </section>
    `;
  }

  function renderTasks() {
    const openTasks = data.tasks.filter((task) => !task.done).length;
    const highPriority = data.tasks.filter((task) => task.priority === "High").length;
    return html`
      <div class="page-stack">
        <section class="tasks-hero">
          <div>
            <p class="eyebrow">Follow-up rhythm</p>
            <h2>${openTasks} open tasks</h2>
            <span>${highPriority} high-priority items need attention today.</span>
          </div>
          <button class="button primary">Add Task</button>
        </section>
        <section class="card tasks-list">
          ${data.tasks
            .map(
              (task) => html`
                <label class="full-task ${task.done ? "complete" : ""}">
                  <input type="checkbox" ${task.done ? "checked" : ""} />
                  <div><strong>${task.title}</strong><span>${task.owner} - ${task.due}</span></div>
                  <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
                </label>
              `,
            )
            .join("")}
        </section>
      </div>
    `;
  }

  function renderSettings() {
    return html`
      <div class="settings-grid">
        <section class="brand-preview">
          <div class="brand-mark">P</div>
          <p class="eyebrow">Brand preview</p>
          <h2>Pusha CRM</h2>
          <p>Gold accent, black interface anchors, crisp white surfaces, and a lightweight sales rhythm.</p>
        </section>
        <section class="card settings-card">
          <h2>Theme summary</h2>
          <div class="swatches">
            <span style="background:#d8aa3b"></span>
            <span style="background:#101010"></span>
            <span style="background:#ffffff"></span>
          </div>
          <p>Premium, minimal, responsive, and ready for API-backed data later.</p>
        </section>
        <section class="card settings-card">
          <h2>Company settings</h2>
          <label>Company name<input value="Pusha CRM Demo" /></label>
          <label>Workspace region<input value="South Africa" /></label>
          <button class="button secondary">Save placeholder</button>
        </section>
      </div>
    `;
  }

  function renderLeadDrawer(lead) {
    return html`
      <div class="overlay" data-close-drawer>
        <aside class="drawer" role="dialog" aria-label="${lead.name} lead detail">
          <button class="icon-button close" data-close-drawer>Close</button>
          <p class="eyebrow">Lead detail</p>
          <h2>${lead.name}</h2>
          <span class="status ${statusClass(lead.status)}">${lead.status}</span>
          <dl>
            <div><dt>Contact</dt><dd>${lead.contact}</dd></div>
            <div><dt>Email</dt><dd>${lead.email}</dd></div>
            <div><dt>Phone</dt><dd>${lead.phone}</dd></div>
            <div><dt>Pipeline value</dt><dd>${currency(lead.value)}</dd></div>
            <div><dt>Owner</dt><dd>${lead.owner}</dd></div>
          </dl>
          <p>${lead.notes}</p>
          <button class="button primary">Create follow-up</button>
        </aside>
      </div>
    `;
  }

  function renderClientModal(client) {
    return html`
      <div class="overlay centered" data-close-client>
        <section class="modal" role="dialog" aria-label="${client.name} client detail">
          <img src="${client.image}" alt="${client.name} team" />
          <button class="icon-button close" data-close-client>Close</button>
          <p class="eyebrow">${client.industry}</p>
          <h2>${client.name}</h2>
          <p>${client.contact} leads the relationship. Current health score is ${client.health}%.</p>
          <a class="button secondary" href="mailto:${client.email}">Email client</a>
        </section>
      </div>
    `;
  }

  function animateCounters() {
    document.querySelectorAll("[data-counter]").forEach((element) => {
      const target = Number(element.dataset.counter);
      const prefix = element.dataset.prefix || "";
      const duration = 900;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        element.textContent = prefix ? currency(current) : number(current);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  function bindEvents() {
    document.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => setRoute(button.dataset.route));
    });
    document.querySelector("[data-login]")?.addEventListener("click", () => setRoute("dashboard"));
    document.querySelector("[data-toggle-nav]")?.addEventListener("click", () => {
      state.sidebarOpen = !state.sidebarOpen;
      render();
    });
    document.querySelector("[data-close-nav]")?.addEventListener("click", () => {
      state.sidebarOpen = false;
      render();
    });
    document.querySelector("[data-lead-search]")?.addEventListener("input", (event) => {
      state.leadQuery = event.target.value;
      render();
    });
    document.querySelector("[data-lead-status]")?.addEventListener("change", (event) => {
      state.leadStatus = event.target.value;
      render();
    });
    document.querySelectorAll("[data-lead-id]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedLead = data.leads.find((lead) => lead.id === Number(row.dataset.leadId));
        render();
      });
    });
    document.querySelectorAll("[data-client-id]").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedClient = data.clients.find((client) => client.id === Number(card.dataset.clientId));
        render();
      });
    });
    document.querySelectorAll("[data-close-drawer]").forEach((element) => {
      element.addEventListener("click", (event) => {
        if (event.target === element || element.classList.contains("close")) {
          state.selectedLead = null;
          render();
        }
      });
    });
    document.querySelectorAll("[data-close-client]").forEach((element) => {
      element.addEventListener("click", (event) => {
        if (event.target === element || element.classList.contains("close")) {
          state.selectedClient = null;
          render();
        }
      });
    });
    bindDragAndDrop();
  }

  function bindDragAndDrop() {
    document.querySelectorAll(".deal-card").forEach((card) => {
      card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", card.dataset.dealId);
      });
    });
    document.querySelectorAll(".kanban-column").forEach((column) => {
      column.addEventListener("dragover", (event) => {
        event.preventDefault();
        column.classList.add("drag-over");
      });
      column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
      column.addEventListener("drop", (event) => {
        event.preventDefault();
        const id = Number(event.dataTransfer.getData("text/plain"));
        state.deals = state.deals.map((deal) =>
          deal.id === id ? { ...deal, stage: column.dataset.stage } : deal,
        );
        render();
      });
    });
  }

  window.addEventListener("hashchange", () => {
    const route = routeIds.includes(location.hash.slice(1)) ? location.hash.slice(1) : "login";
    if (route !== state.route) setRoute(route);
  });

  render();
  if (state.route === "dashboard") requestAnimationFrame(animateCounters);
})();
