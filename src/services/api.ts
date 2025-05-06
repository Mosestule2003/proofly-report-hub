
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  description: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  landlordInfo?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStepStatus = 
  'PENDING_MATCH' | 
  'OUTREACH_INITIATED' | 
  'OUTREACH_SCHEDULING' | 
  'OUTREACH_SCHEDULED' |
  'EN_ROUTE' | 
  'ARRIVED' | 
  'EVALUATING' | 
  'COMPLETED' | 
  'REPORT_READY';

export interface Evaluator {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  completedEvaluations?: number;
  phone?: string;
  email?: string;
}

export interface AgentContact {
  name: string;
  phone: string;
  email: string;
  lastContactedAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  propertyId: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
  rush: boolean;
  notes: string;
  currentStep?: OrderStepStatus;
  currentPropertyIndex?: number;
  properties: Property[];
  evaluator?: Evaluator;
  totalPrice?: number;
  agentContact?: AgentContact;
}

// Mock implementation of API service
class ApiService {
  private users: User[] = [];
  
  // User methods
  getAllUsers = async (): Promise<User[]> => {
    return this.users;
  };
  
  createUser = async (userData: { email: string; name: string; password: string; role: string }): Promise<User> => {
    const newUser: User = {
      id: crypto.randomUUID(),
      firstName: userData.name.split(' ')[0],
      lastName: userData.name.split(' ').slice(1).join(' '),
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    return newUser;
  };
  
  syncUsers = (users: any[]): void => {
    this.users = users.map(user => ({
      id: user.id,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    }));
  };
  
  // Admin methods
  returnToAdmin = async (): Promise<void> => {
    // In a real implementation, this would handle impersonation logic
    const adminId = localStorage.getItem('admin_return_user');
    if (adminId) {
      const allUsers = await this.getAllUsers();
      const adminUser = allUsers.find(user => user.id === adminId);
      
      if (adminUser) {
        localStorage.removeItem('admin_return_user');
        localStorage.setItem('proofly_user', JSON.stringify({
          id: adminUser.id,
          name: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
          email: adminUser.email,
          role: adminUser.role
        }));
      }
    }
  };
}

export const api = new ApiService();
