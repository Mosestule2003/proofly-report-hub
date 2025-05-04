
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Order, api } from '@/services/api';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import {
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  Search as SearchIcon,
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from '@/components/ui/separator';

// Define number of items per page
const ITEMS_PER_PAGE = 10;

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Protect route - only admins can access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast.error("Unauthorized access");
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  // Load all orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user || user.role !== 'admin') return;
      setIsLoading(true);
      
      try {
        // Initialize mock data to ensure test orders exist
        await api.initMockData(user);
        
        // Get all orders from the API
        const allOrders = await api.getOrders();
        console.log("Admin Orders: Retrieved orders:", allOrders);
        
        // Sort orders by date (newest first)
        const sortedOrders = [...allOrders].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setOrderCount(sortedOrders.length);
        setTotalPages(Math.ceil(sortedOrders.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();

    // Subscribe to WebSocket updates
    const unsubscribe = api.subscribeToAdminUpdates(data => {
      if (data.type === 'ORDER_CREATED' || data.type === 'ORDER_UPDATED' || data.type === 'ORDER_STEP_UPDATE') {
        // Refresh orders
        api.getOrders().then(updatedOrders => {
          const sortedOrders = [...updatedOrders].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
          applyFilters(sortedOrders, searchTerm, statusFilter, dateFilter);
          setOrderCount(sortedOrders.length);
          setTotalPages(Math.ceil(sortedOrders.length / ITEMS_PER_PAGE));
        });

        // Show a toast notification for new orders
        if (data.type === 'ORDER_CREATED') {
          toast.success(`New order received! Order #${data.order.id.substring(0, 8)}`);
        }
      }
    });

    // Ensure all orders are visible to admin
    api.ensureOrdersVisibleToAdmin();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [user]);

  // Filter orders when search term or filters change
  useEffect(() => {
    applyFilters(orders, searchTerm, statusFilter, dateFilter);
  }, [searchTerm, statusFilter, dateFilter, orders]);

  // Apply all filters
  const applyFilters = (allOrders: Order[], search: string, status: string, dateRange: string) => {
    let filtered = [...allOrders];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchLower) || 
        order.properties.some(p => p.address.toLowerCase().includes(searchLower)) || 
        (order.agentContact?.name && order.agentContact.name.toLowerCase().includes(searchLower)) ||
        getUserName(order.userId).toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }
    
    // Apply date filter
    if (dateRange) {
      const now = new Date();
      let dateLimit: Date;
      
      switch (dateRange) {
        case '7days':
          dateLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          dateLimit = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          dateLimit = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1year':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateLimit = new Date(0); // All dates
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= dateLimit);
    }
    
    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Helper function to get user name from userId
  const getUserName = (userId: string): string => {
    const user = orders.find(order => order.userId === userId)?.agentContact?.name;
    return user || "Unknown User";
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Evaluator Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Report Ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // View details handler
  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Advance order status handler
  const handleAdvanceOrderStatus = async (orderId: string) => {
    try {
      await api.advanceOrderStep(orderId);
      toast.success("Order status advanced successfully");
    } catch (error) {
      console.error('Error advancing order status:', error);
      toast.error("Failed to advance order status");
    }
  };
  
  // Handle bulk operations
  const handleBulkAdvance = async () => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }
    
    try {
      for (const orderId of selectedOrders) {
        await api.advanceOrderStep(orderId);
      }
      toast.success(`Advanced ${selectedOrders.length} orders`);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      toast.error("Failed to complete bulk operation");
    }
  };
  
  // Handle select all orders on current page
  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      const currentPageOrders = getCurrentPageOrders().map(order => order.id);
      setSelectedOrders(currentPageOrders);
    } else {
      setSelectedOrders([]);
    }
  };
  
  // Handle toggle order selection
  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };
  
  // Get current page orders
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!user) return;
      
      await api.initMockData(user);
      const allOrders = await api.getOrders();
      
      const sortedOrders = [...allOrders].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setOrders(sortedOrders);
      applyFilters(sortedOrders, searchTerm, statusFilter, dateFilter);
      toast.success("Orders refreshed successfully");
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast.error("Failed to refresh orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Left sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="pl-64 min-h-screen">
        <div className="container py-6">
          {/* Top bar */}
          <AdminTopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          {/* Orders List */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Orders Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage all customer orders
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast.success("Export feature will be implemented soon")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>Create Order</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters Bar */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex flex-1 max-w-md relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search orders by ID, address, agent..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="1year">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Evaluator Assigned">Evaluator Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Report Ready">Report Ready</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        More Filters
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <h4 className="font-medium">Filter Orders</h4>
                        <Separator />
                        <div className="grid gap-2">
                          <h5 className="text-sm font-medium">Price Range</h5>
                          <div className="flex items-center gap-2">
                            <Input placeholder="Min" className="h-8" />
                            <span>-</span>
                            <Input placeholder="Max" className="h-8" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <h5 className="text-sm font-medium">Property Count</h5>
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, "4+"].map((num) => (
                              <Button key={num} variant="outline" size="sm" className="h-8">
                                {num}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="ghost" size="sm">Reset</Button>
                          <Button size="sm">Apply Filters</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedOrders.length > 0 && (
                <div className="bg-primary/5 p-2 rounded-md mb-4 flex justify-between items-center">
                  <span className="text-sm font-medium ml-2">
                    {selectedOrders.length} orders selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrders([])}>
                      Clear Selection
                    </Button>
                    <Button size="sm" onClick={handleBulkAdvance}>
                      <Check className="h-4 w-4 mr-2" />
                      Advance Selected
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox 
                              checked={
                                getCurrentPageOrders().length > 0 &&
                                getCurrentPageOrders().every(order => 
                                  selectedOrders.includes(order.id)
                                )
                              }
                              onCheckedChange={handleSelectAllOrders}
                            />
                          </TableHead>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Properties</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageOrders().length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          getCurrentPageOrders().map(order => (
                            <TableRow 
                              key={order.id}
                              selected={selectedOrders.includes(order.id)}
                            >
                              <TableCell>
                                <Checkbox 
                                  checked={selectedOrders.includes(order.id)}
                                  onCheckedChange={() => handleToggleOrderSelection(order.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                #{order.id.substring(0, 8)}
                              </TableCell>
                              <TableCell>
                                {format(new Date(order.createdAt), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                {getUserName(order.userId)}
                              </TableCell>
                              <TableCell>
                                {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                              </TableCell>
                              <TableCell>
                                {order.agentContact?.name || 'N/A'}
                              </TableCell>
                              <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleViewDetails(order.id)}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleAdvanceOrderStatus(order.id)}
                                    title="Advance status"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => toast.success("View report feature will be implemented soon")}
                                    title="View report"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={9} className="text-muted-foreground">
                            <div className="flex items-center justify-between py-1">
                              <span>
                                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                              </span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={currentPage === 1}
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center text-sm">
                                  Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={currentPage >= totalPages}
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
