
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, FileText, FileImage } from 'lucide-react';
import { Order } from '@/services/api';
import { Separator } from '@/components/ui/separator';
import EvaluatorProfile from '@/components/EvaluatorProfile';

interface CompletedOrdersProps {
  completedOrders: Order[];
}

const CompletedOrders: React.FC<CompletedOrdersProps> = ({ completedOrders }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Evaluations</CardTitle>
      </CardHeader>
      <CardContent>
        {completedOrders.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No completed evaluations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedOrders.map(order => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Completed on {format(new Date(order.createdAt), 'MMM d, yyyy')} • 
                        {order.properties.length} {order.properties.length === 1 ? 'property' : 'properties'}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Report Ready
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Assigned Evaluator */}
                  {order.evaluator && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Evaluation by
                      </p>
                      <EvaluatorProfile evaluator={order.evaluator} variant="compact" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Report Complete</span>
                    </div>
                    <div className="flex items-center">
                      <FileImage className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Images Available</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    {order.properties.slice(0, 4).map((property, index) => (
                      <div key={property.id} className="border rounded-md p-3">
                        <p className="font-medium truncate">{property.address}</p>
                      </div>
                    ))}
                  </div>
                  
                  {order.properties.length > 4 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      + {order.properties.length - 4} more properties
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="ml-auto">
                    View Report
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

export default CompletedOrders;
