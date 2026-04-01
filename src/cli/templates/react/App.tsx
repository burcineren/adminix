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

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Adminix 
        resources={resources} 
        title="Adminix Panel" 
        defaultDarkMode={true} 
      />
    </div>
  );
}

export default App;
