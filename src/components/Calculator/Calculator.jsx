import { useState } from 'react';
import { CalculatorIcon as CalculatorIcon } from '@heroicons/react/24/outline';
import { CubeIcon as Package, TruckIcon as Truck, CreditCardIcon as CreditCard } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import CalculatorHeader from './CalculatorHeader';
import CostInputField from './CostInputField';
import MarginSelector from './MarginSelector';
import CustomCostsInput from './CustomCostsInput';
import RealtimeResults from './RealtimeResults';
import DetailedResults from './DetailedResults';
import { useCostInput } from '../../hooks';

/**
 * Smart Pricing Calculator Component
 * 
 * A smart pricing tool that helps you set accurate selling prices based on 
 * your real costs and your desired profit margin.
 * 
 * @param {Function} onUsePrice - Optional callback when "use this price" is clicked (for modal mode)
 * @param {boolean} isModalMode - Whether calculator is used in modal mode
 */
const Calculator = ({ onUsePrice, isModalMode = false }) => {
  const { t, formatCurrency } = useLanguage();

  // Cost inputs using custom hook
  const supplierCost = useCostInput('', () => setResult(null));
  const shippingCost = useCostInput('', () => setResult(null));
  const packagingCost = useCostInput('', () => setResult(null));
  const platformFees = useCostInput('', () => setResult(null));

  const [customCosts, setCustomCosts] = useState([{ id: 1, name: '', amount: '' }]);
  const [desiredMargin, setDesiredMargin] = useState('');
  const [result, setResult] = useState(null);
  const [realtimeResult, setRealtimeResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const addCustomCost = () => {
    setCustomCosts([...customCosts, { id: Date.now(), name: '', amount: '' }]);
  };

  const removeCustomCost = (id) => {
    setCustomCosts(customCosts.filter(cost => cost.id !== id));
  };

  const updateCustomCost = (id, field, value) => {
    setCustomCosts(customCosts.map(cost =>
      cost.id === id ? { ...cost, [field]: value } : cost
    ));
  };

  const handleMarginChange = (value) => {
    setDesiredMargin(value);
    setResult(null);
    if (formErrors.desiredMargin) {
      setFormErrors(prev => ({ ...prev, desiredMargin: '' }));
    }
  };

  const calculatePricing = () => {
    // Parse all costs
    const supplier = parseFloat(supplierCost.value) || 0;
    const shipping = parseFloat(shippingCost.value) || 0;
    const packaging = parseFloat(packagingCost.value) || 0;
    const platform = parseFloat(platformFees.value) || 0;

    // Calculate custom costs total
    const customTotal = customCosts.reduce((sum, cost) => {
      return sum + (parseFloat(cost.amount) || 0);
    }, 0);

    // Calculate total cost
    const totalCost = supplier + shipping + packaging + platform + customTotal;

    if (totalCost <= 0) {
      setResult(null);
      return;
    }

    const margin = parseFloat(desiredMargin) || 0;

    if (margin < 0 || margin >= 100) {
      setResult(null);
      return;
    }

    // Calculate selling price using margin formula: Selling Price = Cost / (1 - Margin/100)
    const sellingPrice = totalCost / (1 - margin / 100);

    // Calculate profit
    const profit = sellingPrice - totalCost;

    // Calculate actual margin percentage (for verification)
    const actualMargin = (profit / sellingPrice) * 100;

    // Calculate profit per unit
    const profitPerUnit = profit;

    setResult({
      supplierCost: supplier,
      shippingCost: shipping,
      packagingCost: packaging,
      platformFees: platform,
      customCosts: customCosts.filter(c => c.name && c.amount),
      customCostsTotal: customTotal,
      totalCost,
      desiredMargin: margin,
      sellingPrice,
      profit,
      actualMargin,
      profitPerUnit,
    });
  };

  const validateForm = () => {
    const errors = {};

    // Supplier cost is required
    if (!supplierCost.value || supplierCost.value.trim() === '' || parseFloat(supplierCost.value) <= 0) {
      errors.supplierCost = t('fieldRequired') || 'שדה זה חובה';
    }

    // Desired margin is required
    if (!desiredMargin || desiredMargin.trim() === '') {
      errors.desiredMargin = t('fieldRequired') || 'שדה זה חובה';
    }

    return errors;
  };

  const handleCalculate = (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    calculatePricing();
  };

  const resetCalculator = () => {
    supplierCost.reset();
    shippingCost.reset();
    packagingCost.reset();
    platformFees.reset();
    setCustomCosts([{ id: 1, name: '', amount: '' }]);
    setDesiredMargin('');
    setResult(null);
    setRealtimeResult(null);
    setValidationErrors({});
    setFormErrors({});
  };

  return (
    <div className={isModalMode ? "w-full" : "w-full py-6"}>
      {!isModalMode && (
        <div className="mb-6">
          <CalculatorHeader />
        </div>
      )}

      {isModalMode ? (
        // Modal Mode: Single column layout
        <div className="w-full space-y-6">
          {/* Realtime Results */}
          <RealtimeResults
            costs={{
              supplierCost: supplierCost.value,
              shippingCost: shippingCost.value,
              packagingCost: packagingCost.value,
              platformFees: platformFees.value,
            }}
            desiredMargin={desiredMargin}
            customCosts={customCosts}
            formatCurrency={formatCurrency}
            onResultChange={setRealtimeResult}
            onUsePrice={onUsePrice}
          />

          {/* Calculator Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <form id="calculator-form" name="calculatorForm" onSubmit={handleCalculate} className="space-y-6">
              <MarginSelector
                value={desiredMargin}
                onChange={handleMarginChange}
                error={formErrors.desiredMargin}
              />

              <div className="grid grid-cols-2 gap-4">
                <CostInputField
                  id="supplier-cost"
                  name="supplierCost"
                  label={t('supplierCost') || 'עלות ספק'}
                  Icon={Package}
                  value={supplierCost.value}
                  onChange={(e) => {
                    supplierCost.handleChange(e);
                    if (formErrors.supplierCost) {
                      setFormErrors(prev => ({ ...prev, supplierCost: '' }));
                    }
                  }}
                  onBlur={supplierCost.handleBlur}
                  error={supplierCost.error || formErrors.supplierCost}
                  required
                />

                <CostInputField
                  id="shipping-cost"
                  name="shippingCost"
                  label={t('shippingCost') || 'עלות משלוח'}
                  Icon={Truck}
                  value={shippingCost.value}
                  onChange={shippingCost.handleChange}
                  onBlur={shippingCost.handleBlur}
                  error={shippingCost.error}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CostInputField
                  id="packaging-cost"
                  name="packagingCost"
                  label={t('packagingCost') || 'עלות אריזה'}
                  Icon={Package}
                  value={packagingCost.value}
                  onChange={packagingCost.handleChange}
                  onBlur={packagingCost.handleBlur}
                  error={packagingCost.error}
                />

                <CostInputField
                  id="platform-fees"
                  name="platformFees"
                  label={t('platformOrTransactionFees') || 'עמלות פלטפורמה או עסקאות'}
                  Icon={CreditCard}
                  value={platformFees.value}
                  onChange={platformFees.handleChange}
                  onBlur={platformFees.handleBlur}
                  error={platformFees.error}
                />
              </div>

              <CustomCostsInput
                customCosts={customCosts}
                onAdd={addCustomCost}
                onRemove={removeCustomCost}
                onUpdate={updateCustomCost}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
              />
            </form>
          </div>
        </div>
      ) : (
        // Page Mode: Two-column layout
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full h-full">
          {/* Left Column: Calculator Form */}
          <div className="card flex flex-col max-h-[calc(100vh-12rem)] overflow-hidden">
            <form id="calculator-form" name="calculatorForm" onSubmit={handleCalculate} className="space-y-6 flex-1 overflow-y-auto">
              <MarginSelector
                value={desiredMargin}
                onChange={handleMarginChange}
                error={formErrors.desiredMargin}
              />

              <div className="grid grid-cols-2 gap-4">
                <CostInputField
                  id="supplier-cost"
                  name="supplierCost"
                  label={t('supplierCost') || 'עלות ספק'}
                  Icon={Package}
                  value={supplierCost.value}
                  onChange={(e) => {
                    supplierCost.handleChange(e);
                    if (formErrors.supplierCost) {
                      setFormErrors(prev => ({ ...prev, supplierCost: '' }));
                    }
                  }}
                  onBlur={supplierCost.handleBlur}
                  error={supplierCost.error || formErrors.supplierCost}
                  required
                />

                <CostInputField
                  id="shipping-cost"
                  name="shippingCost"
                  label={t('shippingCost') || 'עלות משלוח'}
                  Icon={Truck}
                  value={shippingCost.value}
                  onChange={shippingCost.handleChange}
                  onBlur={shippingCost.handleBlur}
                  error={shippingCost.error}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CostInputField
                  id="packaging-cost"
                  name="packagingCost"
                  label={t('packagingCost') || 'עלות אריזה'}
                  Icon={Package}
                  value={packagingCost.value}
                  onChange={packagingCost.handleChange}
                  onBlur={packagingCost.handleBlur}
                  error={packagingCost.error}
                />

                <CostInputField
                  id="platform-fees"
                  name="platformFees"
                  label={t('platformOrTransactionFees') || 'עמלות פלטפורמה או עסקאות'}
                  Icon={CreditCard}
                  value={platformFees.value}
                  onChange={platformFees.handleChange}
                  onBlur={platformFees.handleBlur}
                  error={platformFees.error}
                />
              </div>

              <CustomCostsInput
                customCosts={customCosts}
                onAdd={addCustomCost}
                onRemove={removeCustomCost}
                onUpdate={updateCustomCost}
                validationErrors={validationErrors}
                setValidationErrors={setValidationErrors}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 flex-row">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center gap-2 flex-row-reverse"
                >
                  <CalculatorIcon className="w-[18px] h-[18px]" />
                  <span>{t('calculate') || 'חשב'}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetCalculator}
                >
                  {t('reset') || 'איפוס'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Detailed Results */}
          <div className="lg:sticky lg:top-24 lg:self-start flex flex-col max-h-[calc(100vh-12rem)]">
            <DetailedResults
              costs={{
                supplierCost: supplierCost.value,
                shippingCost: shippingCost.value,
                packagingCost: packagingCost.value,
                platformFees: platformFees.value,
              }}
              desiredMargin={desiredMargin}
              customCosts={customCosts}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
