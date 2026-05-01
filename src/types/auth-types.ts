export interface User {
  id: string | number;
  email: string;
  name?: string;
  avatar?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  roles: string[];
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
}

export interface AuthConfig {
  loginEndpoint?: string;
  userEndpoint?: string;
  registerEndpoint?: string;
  tokenField?: string; // Where to find the token in the response, default: "token"
  userField?: string;  // Where to find the user in the response, default: "user"
  storageKey?: string; // Local storage key
  // Custom Provider for Firebase, Supabase, Auth0, etc.
  provider?: AuthProvider;
}

export interface AuthProvider {
  login: (credentials: unknown) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  register?: (data: unknown) => Promise<{ user: User; token: string }>;
  getUser?: (token: string) => Promise<User>;
}

export interface GlobalPermissions {
  [resourceName: string]: {
    create?: string[];
    edit?: string[];
    delete?: string[];
    view?: string[];
    [action: string]: string[] | undefined;
  };
}
