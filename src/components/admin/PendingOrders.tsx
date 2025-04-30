import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ChevronUp, ChevronDown, MapPin, User, Mail, Phone, Briefcase } from 'lucide-react';
import { Order } from '@/services/api';
import { Evaluator } from '@/components/EvaluatorProfile';
import { toast } from 'sonner';
import notificationService from '@/utils/notificationService';

interface PendingOrdersProps {
  pendingOrders: Order[];
  evaluators: Evaluator[];
  onUpdateStatus: (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => Promise<void>;
  className?: string; // Added className prop
}

const PendingOrders: React.FC<PendingOrdersProps> = ({ 
  pendingOrders, 
  evaluators,
  onUpdateStatus,
  className = '' // Default empty string
}) => {
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string | null>(null);

  const togglePropertyExpand = (propertyId: string) => {
    setExpandedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pending Evaluation Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingOrders.length === 0 ? (
          <div className="py-8 text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending orders at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                        {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {/* Properties */}
                  <div className="space-y-3">
                    {order.properties.map(property => (
                      <div key={property.id} className="border rounded-md p-3">
                        <div 
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => togglePropertyExpand(property.id)}
                        >
                          <div>
                            <p className="font-medium">{property.address}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {expandedProperties.includes(property.id) 
                              ? <ChevronUp className="h-4 w-4" />
                              : <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                        
                        {expandedProperties.includes(property.id) && (
                          <div className="mt-3 space-y-2">
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{property.address}</span>
                              </div>
                              {property.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {property.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Agent/Landlord Contact */}
                  {order.agentContact && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Agent/Landlord Contact</h3>
                      <div className="bg-muted/20 p-3 rounded-md border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Name</p>
                              <p className="text-sm">{order.agentContact.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm">{order.agentContact.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="text-sm">{order.agentContact.phone}</p>
                            </div>
                          </div>
                          
                          {order.agentContact.company && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Company</p>
                                <p className="text-sm">{order.agentContact.company}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Evaluator Assignment */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Assign Evaluator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {evaluators.map(evaluator => (
                        <div 
                          key={evaluator.id} 
                          className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                            selectedEvaluator === evaluator.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedEvaluator(evaluator.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                              {evaluator.avatarUrl ? (
                                <img src={evaluator.avatarUrl} alt={evaluator.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                  {evaluator.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{evaluator.name}</p>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-2 w-2 ${
                                      i < Math.floor(evaluator.rating) ? 'bg-amber-500' : 'bg-muted'
                                    } rounded-full mr-0.5`} />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground ml-1">
                                  {evaluator.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="ml-auto" 
                    onClick={() => {
                      onUpdateStatus(order.id, 'Evaluator Assigned');
                      setSelectedEvaluator(null);
                    }}
                    disabled={!selectedEvaluator}
                  >
                    Assign & Accept Order
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrders;
