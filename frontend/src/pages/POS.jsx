import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import CheckoutModal from '../components/pos/CheckoutModal';
import BarcodeScannerModal from '../components/pos/BarcodeScannerModal';
import Modal from '../components/common/Modal';
import InvoiceView from '../components/invoice/InvoiceView';
import { usePosStore } from '../store/posStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const POS = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    customer,
    setCustomer,
    getTotals,
  } = usePosStore();

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await API.get('/products?limit=100');
      setProducts(res.data.products || []);
      setCategories(res.data.meta?.categories || []);
    } catch (err) {
      toast.error('Failed to load POS product inventory');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      toast.success(`Added ${product.productName} to cart`, { id: product._id, duration: 1500 });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateQuantity = (productId, delta) => {
    try {
      updateQuantity(productId, delta);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFindProductByBarcode = (barcode) => {
    const matched = products.find((p) => p.barcode === barcode);
    if (matched) {
      handleAddToCart(matched);
      setIsBarcodeModalOpen(false);
    } else {
      toast.error(`No product found with barcode '${barcode}'`);
    }
  };

  const handleConfirmCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const totals = getTotals();
      const payload = {
        products: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        discount: totals.discount,
        customer,
        paymentMethod,
      };

      const res = await API.post('/sales', payload);
      const createdSale = res.data;

      setCompletedSale(createdSale);
      clearCart();
      setIsCheckoutModalOpen(false);
      toast.success(`Sale completed! Invoice #${createdSale.invoiceNo}`);
      // Refresh products stock in state
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Checkout failed. Stock might be insufficient.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loadingProducts) return <LoadingSpinner label="Initializing POS Terminal & Products..." />;

  const totals = getTotals();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Left: Product Catalog Grid */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col min-w-0">
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          categories={categories}
          onScanBarcodeClick={() => setIsBarcodeModalOpen(true)}
        />
      </div>

      {/* Right: Cart & Checkout Panel */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <Cart
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          totals={totals}
          discount={discount}
          onDiscountChange={setDiscount}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          customer={customer}
          onCustomerChange={setCustomer}
          onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
          loading={checkoutLoading}
        />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        totals={totals}
        customer={customer}
        paymentMethod={paymentMethod}
        onConfirmCheckout={handleConfirmCheckout}
        loading={checkoutLoading}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onFindProductByBarcode={handleFindProductByBarcode}
      />

      {/* Invoice Generated Success Modal */}
      <Modal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        title="Transaction Invoice"
        maxWidth="max-w-3xl"
      >
        <InvoiceView sale={completedSale} onPrint={handlePrintInvoice} />
      </Modal>
    </div>
  );
};

export default POS;
