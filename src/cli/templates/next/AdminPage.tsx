"use client";

import { Adminix, type ResourceDefinition } from "adminix";
import "adminix/style.css";

const resources: ResourceDefinition[] = [
  {
    name: "products",
    endpoint: "/api/products",
    label: "Inventory Management",
    fields: [],
  },
  {
    name: "users",
    endpoint: "/api/users",
    label: "User Accounts",
    fields: [],
  }
];

export default function AdminPage() {
  return (
    <div className="h-screen w-full">
      <Adminix 
        resources={resources} 
        title="Next.js Admin Panel" 
        defaultDarkMode={true} 
      />
    </div>
  );
}
