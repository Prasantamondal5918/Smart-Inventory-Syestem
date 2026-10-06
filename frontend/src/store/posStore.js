import { create } from 'zustand';

export const usePosStore = create((set, get) => ({
  cart: [],
  discount: 0,
  paymentMethod: 'cash',
  customer: {
    name: 'Walk-in Customer',
    phone: '',
    address: '',
  },

  addToCart: (product) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product._id === product._id);

    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      if (existingItem.quantity >= product.stock) {
        throw new Error(`Cannot add more than available stock (${product.stock})`);
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      set({ cart: updatedCart });
    } else {
      if (product.stock < 1) {
        throw new Error(`Product '${product.productName}' is out of stock`);
      }
      set({ cart: [...cart, { product, quantity: 1 }] });
    }
  },

  updateQuantity: (productId, delta) => {
    const { cart } = get();
    const updatedCart = cart
      .map((item) => {
        if (item.product._id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            throw new Error(`Cannot exceed available stock (${item.product.stock})`);
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    set({ cart: updatedCart });
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product._id !== productId) });
  },

  clearCart: () => {
    set({
      cart: [],
      discount: 0,
      paymentMethod: 'cash',
      customer: { name: 'Walk-in Customer', phone: '', address: '' },
    });
  },

  setDiscount: (discount) => set({ discount: Math.max(0, Number(discount) || 0) }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setCustomer: (customerData) => set({ customer: { ...get().customer, ...customerData } }),

  getTotals: () => {
    const { cart, discount } = get();
    let subtotal = 0;
    let tax = 0;

    cart.forEach((item) => {
      const lineSubtotal = item.product.sellingPrice * item.quantity;
      const lineTax = ((item.product.sellingPrice * (item.product.taxPercentage || 0)) / 100) * item.quantity;
      subtotal += lineSubtotal;
      tax += lineTax;
    });

    const total = Math.max(0, subtotal + tax - discount);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
}));
