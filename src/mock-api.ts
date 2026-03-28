// Mock API server using MSW-like approach but built-in
// We create an in-memory store and intercept fetch calls

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: string;
  image?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  isPublic: boolean;
  lastUpdated: string;
}

// ── In-memory stores ───────────────────────────────────────────────────────────

let products: Product[] = [
  { id: 1, name: "Pro Laptop 15\"", price: 1299, category: "electronics", inStock: true, createdAt: "2024-01-10", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=64&h=64&fit=crop" },
  { id: 2, name: "Wireless Headphones X", price: 249, category: "electronics", inStock: true, createdAt: "2024-01-15", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=64&h=64&fit=crop" },
  { id: 3, name: "Ergonomic Chair Pro", price: 549, category: "furniture", inStock: false, createdAt: "2024-01-20" },
  { id: 4, name: "Standing Desk XL", price: 899, category: "furniture", inStock: true, createdAt: "2024-02-01" },
  { id: 5, name: "Mechanical Keyboard", price: 179, category: "electronics", inStock: true, createdAt: "2024-02-05" },
  { id: 6, name: "4K Monitor 27\"", price: 599, category: "electronics", inStock: true, createdAt: "2024-02-10" },
  { id: 7, name: "Leather Notebook", price: 29, category: "stationery", inStock: true, createdAt: "2024-02-15" },
  { id: 8, name: "Travel Backpack", price: 89, category: "accessories", inStock: false, createdAt: "2024-02-20" },
  { id: 9, name: "USB-C Hub 7-in-1", price: 59, category: "electronics", inStock: true, createdAt: "2024-03-01" },
  { id: 10, name: "Noise-Cancel Earbuds", price: 199, category: "electronics", inStock: true, createdAt: "2024-03-05" },
  { id: 11, name: "Smart Watch S3", price: 329, category: "electronics", inStock: true, createdAt: "2024-03-10" },
  { id: 12, name: "Desk Lamp LED", price: 45, category: "furniture", inStock: true, createdAt: "2024-03-12" },
];

let users: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", active: true, createdAt: "2024-01-01" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "editor", active: true, createdAt: "2024-01-15" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "viewer", active: false, createdAt: "2024-02-01" },
  { id: 4, name: "Dave Brown", email: "dave@example.com", role: "editor", active: true, createdAt: "2024-02-10" },
  { id: 5, name: "Eve Davis", email: "eve@example.com", role: "admin", active: true, createdAt: "2024-03-01" },
  { id: 6, name: "Frank Miller", email: "frank@example.com", role: "viewer", active: true, createdAt: "2024-03-15" },
];

let orders: Order[] = [
  { id: 1, customer: "Alice Johnson", total: 1548, status: "completed", createdAt: "2024-03-01" },
  { id: 2, customer: "Bob Smith", total: 249, status: "pending", createdAt: "2024-03-05" },
  { id: 3, customer: "Carol Williams", total: 599, status: "processing", createdAt: "2024-03-08" },
  { id: 4, customer: "Dave Brown", total: 89, status: "completed", createdAt: "2024-03-10" },
  { id: 5, customer: "Eve Davis", total: 2197, status: "pending", createdAt: "2024-03-12" },
  { id: 6, customer: "Frank Miller", total: 329, status: "cancelled", createdAt: "2024-03-14" },
  { id: 7, customer: "Grace Lee", total: 178, status: "completed", createdAt: "2024-03-16" },
  { id: 8, customer: "Henry Wilson", total: 899, status: "processing", createdAt: "2024-03-18" },
];

const settings: Setting[] = [
  { id: "1", key: "site_name", value: "ZeroAdmin Demo", description: "The title of the website", category: "general", isPublic: true, lastUpdated: "2024-03-24" },
  { id: "2", key: "admin_email", value: "admin@zeroadmin.io", description: "Primary contact email", category: "general", isPublic: false, lastUpdated: "2024-03-24" },
  { id: "3", key: "enable_signup", value: "true", description: "Allow new users to register", category: "security", isPublic: true, lastUpdated: "2024-03-20" },
  { id: "4", key: "maintenance_mode", value: "false", description: "Disable site for maintenance", category: "security", isPublic: false, lastUpdated: "2024-03-22" },
  { id: "5", key: "max_upload_size", value: "10", description: "Limit in MB", category: "performance", isPublic: true, lastUpdated: "2024-03-15" },
];

let nextId = 100;
function generateId() { return ++nextId; }

// ── Generic paginate helper ────────────────────────────────────────────────────

function paginate<T extends Record<string, unknown>>(
  items: T[],
  params: URLSearchParams
): { data: T[]; total: number } {
  const page = parseInt(params.get("page") ?? "1");
  const pageSize = parseInt(params.get("pageSize") ?? "10");
  const search = params.get("search")?.toLowerCase() ?? "";
  const sort = params.get("sort") ?? "";
  const order = params.get("order") ?? "asc";

  let filtered = items;

  // Search
  if (search) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((v) =>
        String(v ?? "").toLowerCase().includes(search)
      )
    );
  }

  // Sort
  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (aVal === bVal) return 0;
      const cmp = String(aVal ?? "") < String(bVal ?? "") ? -1 : 1;
      return order === "desc" ? -cmp : cmp;
    });
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return { data, total };
}

// ── Intercept fetch ────────────────────────────────────────────────────────────

const originalFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method ?? "GET").toUpperCase();

  const getParams = () => {
    const q = url.includes("?") ? url.split("?")[1] : "";
    return new URLSearchParams(q);
  };
  const getBody = () => {
    try {
      return JSON.parse(init?.body as string ?? "{}") as Record<string, unknown>;
    } catch {
      return {};
    }
  };
  const getId = () => {
    const seg = url.replace(/\?.*/, "").split("/").pop() ?? "";
    return isNaN(Number(seg)) ? seg : Number(seg);
  };

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  // ── /api/products ──────────────────────────────────────────────────────────

  if (url.includes("/api/products")) {
    await delay(200);
    if (method === "GET" && !url.match(/\/api\/products\/\d+/)) {
      return json(paginate(products as unknown as Record<string, unknown>[], getParams()));
    }
    if (method === "POST") {
      const body = getBody();
      const item: Product = { id: generateId(), createdAt: new Date().toISOString().split("T")[0], ...body } as Product;
      products.push(item);
      return json(item, 201);
    }
    if (method === "PUT") {
      const id = getId();
      const body = getBody();
      products = products.map((p) => (p.id === id ? { ...p, ...body } : p));
      return json(products.find((p) => p.id === id));
    }
    if (method === "DELETE") {
      if (url.includes("bulk-delete")) {
        const body = getBody();
        const ids = (body["ids"] as number[]) ?? [];
        products = products.filter((p) => !ids.includes(p.id));
        return json({ success: true });
      }
      const id = getId();
      products = products.filter((p) => p.id !== id);
      return json({ success: true });
    }
  }

  // ── /api/users ────────────────────────────────────────────────────────────

  if (url.includes("/api/users")) {
    await delay(150);
    if (method === "GET" && !url.match(/\/api\/users\/\d+/)) {
      return json(paginate(users as unknown as Record<string, unknown>[], getParams()));
    }
    if (method === "POST") {
      const body = getBody();
      const item: User = { id: generateId(), createdAt: new Date().toISOString().split("T")[0], ...body } as User;
      users.push(item);
      return json(item, 201);
    }
    if (method === "PUT") {
      const id = getId();
      const body = getBody();
      users = users.map((u) => (u.id === id ? { ...u, ...body } : u));
      return json(users.find((u) => u.id === id));
    }
    if (method === "DELETE") {
      if (url.includes("bulk-delete")) {
        const body = getBody();
        const ids = (body["ids"] as number[]) ?? [];
        users = users.filter((u) => !ids.includes(u.id));
        return json({ success: true });
      }
      const id = getId();
      users = users.filter((u) => u.id !== id);
      return json({ success: true });
    }
  }

  // ── /api/orders ───────────────────────────────────────────────────────────

  if (url.includes("/api/orders")) {
    await delay(180);
    if (method === "GET" && !url.match(/\/api\/orders\/\d+/)) {
      return json(paginate(orders as unknown as Record<string, unknown>[], getParams()));
    }
    if (method === "POST") {
      const body = getBody();
      const item: Order = { id: generateId(), createdAt: new Date().toISOString().split("T")[0], ...body } as Order;
      orders.push(item);
      return json(item, 201);
    }
    if (method === "PUT") {
      const id = getId();
      const body = getBody();
      orders = orders.map((o) => (o.id === id ? { ...o, ...body } : o));
      return json(orders.find((o) => o.id === id));
    }
    if (method === "DELETE") {
      if (url.includes("bulk-delete")) {
        const body = getBody();
        const ids = (body["ids"] as number[]) ?? [];
        orders = orders.filter((o) => !ids.includes(o.id));
        return json({ success: true });
      }
      const id = getId();
      orders = orders.filter((o) => o.id !== id);
      return json({ success: true });
    }
  }

  if (url.includes("/api/settings")) {
    await delay(100);
    return json(paginate(settings as unknown as Record<string, unknown>[], getParams()));
  }

  // ── Generic /api/ Falling Back for Shorthand/Test Resources ──────────────
  if (url.includes("/api/")) {
    await delay(150);
    
    // Use an in-memory storage for arbitrary resources
    if (!window.__mock_storage) window.__mock_storage = {};
    const resourceName = url.split("/api/")[1].split("/")[0].split("?")[0];
    if (!window.__mock_storage[resourceName]) {
      window.__mock_storage[resourceName] = [
        { id: 1, name: "Sample Item", status: "Active", createdAt: new Date().toISOString() }
      ];
    }
    
    let items = window.__mock_storage[resourceName];

    if (method === "GET" && !url.match(new RegExp(`/api/${resourceName}/\\d+`))) {
      return json(paginate(items, getParams()));
    }
    
    if (method === "POST") {
      const body = getBody();
      const item = { id: generateId(), ...body };
      items.push(item);
      return json(item, 201);
    }
    
    if (method === "PUT") {
      const id = getId();
      const body = getBody();
      window.__mock_storage[resourceName] = items.map((i: any) => i.id === id ? { ...i, ...body } : i);
      return json(window.__mock_storage[resourceName].find((i: any) => i.id === id));
    }
    
    if (method === "DELETE") {
      const id = getId();
      window.__mock_storage[resourceName] = items.filter((i: any) => i.id !== id);
      return json({ success: true });
    }
  }

  return originalFetch(input, init);
};

declare global {
  interface Window {
    __mock_storage: Record<string, any[]>;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
