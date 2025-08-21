import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productCatalog } from '@/lib/productCatalog';
import { quoteService } from '@/lib/quoteService';
import { getTemplateById } from '@/lib/projectTemplates';

export default function EVNetTest() {
  const [evnetProduct, setEvnetProduct] = useState(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Find the EVNet product
    const products = productCatalog.getProducts();
    const evnet = products.find(p => p.sku === 'EVNET-CMP-PLATFORM');
    setEvnetProduct(evnet);
  }, []);

  const runIntegrationTest = async () => {
    setIsLoading(true);
    const results: string[] = [];

    try {
      // Test 1: Check if EVNet product exists
      const products = productCatalog.getProducts();
      const evnetProduct = products.find(p => p.sku === 'EVNET-CMP-PLATFORM');
      
      if (evnetProduct) {
        results.push('✅ EVNet product found in catalog');
        results.push(`   - Name: ${evnetProduct.name}`);
        results.push(`   - Category: ${evnetProduct.category}/${evnetProduct.subcategory}`);
        results.push(`   - Price: $${evnetProduct.pricing.recommendedRetail}`);
      } else {
        results.push('❌ EVNet product NOT found in catalog');
      }

      // Test 2: Check project template integration
      const commercialTemplate = getTemplateById('commercial-office');
      if (commercialTemplate?.chargerSelection.evnetPlatform) {
        results.push('✅ Commercial template includes EVNet platform option');
      } else {
        results.push('❌ Commercial template missing EVNet platform option');
      }

      // Test 3: Test quote creation with EVNet
      const mockProjectData = {
        projectId: 'test-project',
        projectName: 'Test EVNet Integration',
        clientRequirements: {
          organizationType: 'office',
          projectObjective: 'employee-benefit'
        },
        siteAssessment: {
          siteType: 'office',
          siteAddress: 'Test Address'
        },
        chargerSelection: {
          chargingType: 'ac-level2',
          powerRating: '11kw',
          numberOfChargers: '4',
          evnetPlatform: true
        },
        estimatedBudget: '$50,000'
      };

      const testQuote = quoteService.createQuote('test-project-' + Date.now());
      if (testQuote) {
        results.push('✅ Test quote created successfully');
        
        // Apply project data to quote
        quoteService.integrateProjectData(testQuote, mockProjectData);
        
        // Check if EVNet platform was added automatically
        const updatedQuote = quoteService.getQuote(testQuote.id);
        const evnetLineItem = updatedQuote?.lineItems.find(
          item => item.name.includes('EVNet')
        );
        
        if (evnetLineItem) {
          results.push('✅ EVNet platform automatically added to quote');
          results.push(`   - Line item: ${evnetLineItem.name}`);
          results.push(`   - Price: $${evnetLineItem.unitPrice}`);
        } else {
          results.push('❌ EVNet platform NOT added to quote automatically');
        }

        // Test 4: Manual product addition
        if (evnetProduct) {
          try {
            quoteService.addProductToQuote(testQuote.id, evnetProduct.id, 1);
            results.push('✅ EVNet product can be manually added to quotes');
          } catch (error) {
            results.push('❌ Failed to manually add EVNet product to quote');
            results.push(`   - Error: ${error.message}`);
          }
        }

        // Clean up test quote
        quoteService.deleteQuote(testQuote.id);
        results.push('✅ Test cleanup completed');
      } else {
        results.push('❌ Failed to create test quote');
      }

    } catch (error) {
      results.push(`❌ Integration test failed: ${error.message}`);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">EVNet Integration Test</h1>
        <Badge variant="outline">Test Page</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charge N Go EVNet Chargepoint Management Platform</CardTitle>
          <CardDescription>
            Testing the integration of the new EVNet service with the quoting and project management systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {evnetProduct ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">Product Details</h3>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p><strong>Name:</strong> {evnetProduct.name}</p>
                <p><strong>SKU:</strong> {evnetProduct.sku}</p>
                <p><strong>Category:</strong> {evnetProduct.category}/{evnetProduct.subcategory}</p>
                <p><strong>Price:</strong> ${evnetProduct.pricing.recommendedRetail}</p>
                <p><strong>Description:</strong> {evnetProduct.description}</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">EVNet product not found in catalog</p>
            </div>
          )}

          <Button 
            onClick={runIntegrationTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Integration Test...' : 'Run Integration Test'}
          </Button>

          {testResults.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className={
                    result.startsWith('✅') ? 'text-green-600' :
                    result.startsWith('❌') ? 'text-red-600' :
                    'text-gray-600 ml-4'
                  }>
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Product Catalog:</strong> EVNet service added with comprehensive specifications</p>
            <p>✅ <strong>Category System:</strong> New "management-platform" subcategory created</p>
            <p>✅ <strong>Project Templates:</strong> Commercial, retail, and fleet templates updated</p>
            <p>✅ <strong>Quote Integration:</strong> Automatic addition when project includes EVNet</p>
            <p>✅ <strong>Manual Addition:</strong> Service can be manually added to any quote</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
