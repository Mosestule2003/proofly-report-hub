
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, ChevronUp, ChevronDown, Clock, RefreshCw, User, Mail, Phone, Briefcase } from 'lucide-react';
import { Order } from '@/services/api';
import EvaluatorProfile from '@/components/EvaluatorProfile';
import PropertyMap from '@/components/PropertyMap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

interface InProgressOrdersProps {
  assignedOrders: Order[];
  onUpdateStatus: (orderId: string, newStatus: 'Evaluator Assigned' | 'In Progress') => Promise<void>;
  onAdvanceOrderStep: (orderId: string) => Promise<void>;
  onSubmitReport: (orderId: string, comments: string, imageUrl: string, videoUrl: string) => Promise<void>;
}

const InProgressOrders: React.FC<InProgressOrdersProps> = ({ 
  assignedOrders, 
  onUpdateStatus,
  onAdvanceOrderStep,
  onSubmitReport
}) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportComments, setReportComments] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [reportVideoUrl, setReportVideoUrl] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  const handleSubmitReport = async () => {
    if (!activeOrder) return;
    
    if (!reportComments.trim()) {
      return;
    }
    
    setIsSubmittingReport(true);
    
    try {
      await onSubmitReport(
        activeOrder.id,
        reportComments,
        reportImageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
        reportVideoUrl
      );
      
      // Reset form
      setReportComments('');
      setReportImageUrl('');
      setReportVideoUrl('');
      setReportDialogOpen(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>In Progress Evaluations</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedOrders.length === 0 ? (
          <div className="py-8 text-center">
            <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders in progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map(order => (
              <Card key={order.id} className="overflow-hidden">
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
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={order.status === 'In Progress' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {order.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        {expandedOrder === order.id 
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={`pb-2 ${expandedOrder === order.id ? 'block' : 'hidden'}`}>
                  <div className="space-y-3 mb-4">
                    {/* Assigned Evaluator */}
                    {order.evaluator && (
                      <div className="border rounded-md p-3 mb-4">
                        <h4 className="font-medium mb-2">Assigned Evaluator</h4>
                        <EvaluatorProfile evaluator={order.evaluator} />
                      </div>
                    )}
                    
                    {/* Agent/Landlord Contact */}
                    {order.agentContact && (
                      <div className="border rounded-md p-3 mb-4">
                        <h4 className="font-medium mb-2">Agent/Landlord Contact</h4>
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
                    )}
                    
                    {/* Current progress */}
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Evaluation Progress</p>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {order.currentStep?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      
                      {order.currentPropertyIndex !== undefined && order.properties.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              Property {order.currentPropertyIndex + 1} of {order.properties.length}
                            </span>
                          </div>
                          
                          {/* Map of current property */}
                          <PropertyMap 
                            properties={order.properties}
                            currentPropertyIndex={order.currentPropertyIndex}
                            currentStep={
                              order.currentStep === 'EN_ROUTE' ? 0 : 
                              order.currentStep === 'ARRIVED' ? 1 : 
                              order.currentStep === 'EVALUATING' ? 2 : 3
                            }
                            evaluator={order.evaluator}
                            className="h-64"
                            showAllProperties={true}
                            interactive={true}
                          />
                          
                          <div className="flex justify-between mt-2">
                            <p className="text-sm font-medium">
                              {order.properties[order.currentPropertyIndex].address}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onAdvanceOrderStep(order.id)}
                              className="h-8"
                            >
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Advance Step
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* All properties */}
                    <h4 className="font-medium mt-4 mb-2">All Properties</h4>
                    <div className="space-y-2">
                      {order.properties.map((property, index) => (
                        <div 
                          key={property.id} 
                          className={`border rounded p-3 ${
                            index === order.currentPropertyIndex ? 'bg-primary/5 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                index < (order.currentPropertyIndex || 0) ? 'bg-green-500' : 
                                index === (order.currentPropertyIndex || 0) ? 'bg-primary animate-pulse' : 
                                'bg-muted-foreground/30'
                              }`}></div>
                              <span className={`${
                                index === order.currentPropertyIndex ? 'font-medium' : ''
                              }`}>
                                {property.address}
                              </span>
                            </div>
                            <Badge variant={index === order.currentPropertyIndex ? "default" : "outline"}>
                              {index < (order.currentPropertyIndex || 0) ? 'Completed' : 
                               index === (order.currentPropertyIndex || 0) ? 'Current' : 
                               'Pending'}
                            </Badge>
                          </div>
                          {property.description && (
                            <p className="text-sm text-muted-foreground mt-2 ml-4">
                              {property.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4">
                  {order.status === 'Evaluator Assigned' && (
                    <Button 
                      variant="outline"
                      onClick={() => onUpdateStatus(order.id, 'In Progress')}
                    >
                      Mark as In Progress
                    </Button>
                  )}
                  
                  <Dialog open={reportDialogOpen && activeOrder?.id === order.id} onOpenChange={(open) => {
                    setReportDialogOpen(open);
                    if (open) setActiveOrder(order);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="ml-auto">Upload Report</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upload Property Evaluation Report</DialogTitle>
                        <DialogDescription>
                          Complete the evaluation report for order #{order.id.substring(0, 8)}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="comments">Evaluation Comments</Label>
                          <Textarea
                            id="comments"
                            placeholder="Enter your detailed evaluation findings..."
                            className="min-h-[150px]"
                            value={reportComments}
                            onChange={(e) => setReportComments(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Image URL (optional)</Label>
                          <Input
                            id="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            value={reportImageUrl}
                            onChange={(e) => setReportImageUrl(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Add a URL to a property image
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl">Video URL (optional)</Label>
                          <Input
                            id="videoUrl"
                            placeholder="https://example.com/video.mp4"
                            value={reportVideoUrl}
                            onChange={(e) => setReportVideoUrl(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Add a URL to a walkthrough video
                          </p>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitReport}
                          disabled={isSubmittingReport || !reportComments.trim()}
                        >
                          {isSubmittingReport ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Report'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InProgressOrders;
