import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Plus,
  Trash2,
  Download,
  Send,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";

export default function QuoteBuilderWorking() {
  const [quoteData, setQuoteData] = useState({
    quoteNumber: "QT-2024-001",
    clientName: "",
    clientEmail: "",
    projectName: "",
    description: "",
    validUntil: "",
    lineItems: [
      {
        id: 1,
        description: "Tesla Wall Connector",
        quantity: 4,
        unitPrice: 750,
        total: 3000,
      },
      {
        id: 2,
        description: "Installation & Wiring",
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
      },
      {
        id: 3,
        description: "Electrical Panel Upgrade",
        quantity: 1,
        unitPrice: 1800,
        total: 1800,
      },
    ],
  });

  const subtotal = quoteData.lineItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const tax = subtotal * 0.1; // 10% GST
  const total = subtotal + tax;

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setQuoteData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const removeLineItem = (id: number) => {
    setQuoteData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const updateLineItem = (id: number, field: string, value: any) => {
    setQuoteData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quote Builder</h1>
            <p className="text-muted-foreground">
              Create professional quotes for EV charging projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{quoteData.quoteNumber}</Badge>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Quote
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Quote Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Quote Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={quoteData.clientName}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          clientName: e.target.value,
                        }))
                      }
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={quoteData.clientEmail}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          clientEmail: e.target.value,
                        }))
                      }
                      placeholder="Enter client email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={quoteData.validUntil}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={quoteData.projectName}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          projectName: e.target.value,
                        }))
                      }
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={quoteData.description}
                      onChange={(e) =>
                        setQuoteData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the project scope and requirements"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Line Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                  <Button
                    onClick={addLineItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Line Items */}
                  {quoteData.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg"
                    >
                      <div className="col-span-5">
                        <Label htmlFor={`desc-${item.id}`}>Description</Label>
                        <Input
                          id={`desc-${item.id}`}
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <div className="text-lg font-semibold p-2 bg-muted rounded">
                          ${item.total.toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-9"></div>
                      <div className="col-span-3 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (10%):</span>
                          <span>${tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Quote Preview</CardTitle>
                <CardDescription>
                  This is how your quote will appear to the client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-4xl">
                  {/* Quote Header */}
                  <div className="text-center border-b pb-6">
                    <h1 className="text-3xl font-bold text-primary">
                      ChargeSource
                    </h1>
                    <p className="text-muted-foreground">
                      EV Charging Infrastructure Solutions
                    </p>
                  </div>

                  {/* Quote Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Quote To:</h3>
                      <p>{quoteData.clientName || "Client Name"}</p>
                      <p>{quoteData.clientEmail || "client@email.com"}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold mb-2">Quote Details:</h3>
                      <p>Quote #: {quoteData.quoteNumber}</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                      {quoteData.validUntil && (
                        <p>
                          Valid Until:{" "}
                          {new Date(quoteData.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      Project: {quoteData.projectName || "Project Name"}
                    </h3>
                    <p className="text-muted-foreground">
                      {quoteData.description ||
                        "Project description will appear here"}
                    </p>
                  </div>

                  {/* Line Items Table */}
                  <div>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-gray-300 p-3 text-left">
                            Description
                          </th>
                          <th className="border border-gray-300 p-3 text-center">
                            Qty
                          </th>
                          <th className="border border-gray-300 p-3 text-right">
                            Unit Price
                          </th>
                          <th className="border border-gray-300 p-3 text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteData.lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="border border-gray-300 p-3">
                              {item.description}
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              {item.quantity}
                            </td>
                            <td className="border border-gray-300 p-3 text-right">
                              ${item.unitPrice.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 p-3 text-right">
                              ${item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="border border-gray-300 p-3 text-right font-semibold"
                          >
                            Subtotal:
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            ${subtotal.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={3}
                            className="border border-gray-300 p-3 text-right font-semibold"
                          >
                            GST (10%):
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            ${tax.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-muted">
                          <td
                            colSpan={3}
                            className="border border-gray-300 p-3 text-right font-bold text-lg"
                          >
                            Total:
                          </td>
                          <td className="border border-gray-300 p-3 text-right font-bold text-lg">
                            ${total.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
