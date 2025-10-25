
import React, { useMemo, useState, useEffect } from 'react';
import type { CartItem, CustomerProfile } from '../types';
import { db, auth } from '../services/firebase';
import { ref, push, set } from 'firebase/database';
import { CloseIcon } from './icons';

interface CartViewProps {
    isVisible: boolean;
    onClose: () => void;
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    customerProfile: CustomerProfile | null;
    onPlaceOrder: () => void;
}

const DELIVERY_FEE = 50.00;

const CartView: React.FC<CartViewProps> = ({ isVisible, onClose, cart, setCart, customerProfile, onPlaceOrder }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customerProfile) {
            setName(customerProfile.name || '');
            setPhone(customerProfile.phone || '');
            setAddress(customerProfile.address || '');
        }
    }, [customerProfile, isVisible]);
    
    const { subtotal, total } = useMemo(() => {
        const sub = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tot = sub > 0 ? sub + DELIVERY_FEE : 0;
        return { subtotal: sub, total: tot };
    }, [cart]);

    const updateQuantity = (itemId: string, change: number) => {
        setCart(currentCart => {
            const item = currentCart.find(i => i.id === itemId);
            if (!item) return currentCart;

            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                return currentCart.filter(i => i.id !== itemId);
            }
            return currentCart.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i);
        });
    };
    
    const handlePlaceOrderClick = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        if (!name.trim() || !phone.trim() || !address.trim()) {
            alert('Please fill in your name, phone, and delivery address.');
            return;
        }

        setLoading(true);

        const newOrderRef = push(ref(db, 'orders'));
        const orderId = newOrderRef.key;
        if (!orderId) {
            alert('Could not create order ID.');
            setLoading(false);
            return;
        }

        const orderData = {
            orderId: orderId,
            customerUid: auth.currentUser?.uid,
            restaurantId: cart[0].restaurantId,
            deliveryUid: '',
            items: cart.map(({ id, name, price, quantity }) => ({ itemId: id, name, price, quantity })),
            subtotal: subtotal,
            deliveryFee: DELIVERY_FEE,
            totalAmount: total,
            customerName: name,
            address: address,
            phone: phone,
            paymentMethod: 'COD',
            status: 'PLACED',
            locationLink: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            await set(newOrderRef, orderData);
            alert(`Order #${orderId.substring(0, 8)} placed successfully! Payment: Cash on Delivery.`);
            onPlaceOrder();
        } catch (error: any) {
            alert('Failed to place order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };


    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-lg h-full overflow-y-auto relative p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-red-500">Your Cart</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <CloseIcon className="w-6 h-6 text-gray-600"/>
                    </button>
                </div>

                <div className="flex-grow">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="border rounded-md w-7 h-7 font-bold">-</button>
                                        <span className="w-10 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="border rounded-md w-7 h-7 font-bold">+</button>
                                    </div>
                                    <p className="font-bold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                     <div className="border-t pt-4 mt-auto">
                        <div className="bg-red-50 p-4 rounded-lg space-y-2 mb-4">
                            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span>Delivery Fee:</span><span>₹{DELIVERY_FEE.toFixed(2)}</span></div>
                            <hr />
                            <div className="flex justify-between font-bold text-lg"><span>Total (COD):</span><span>₹{total.toFixed(2)}</span></div>
                        </div>

                        <h3 className="font-bold mb-2">Delivery Details</h3>
                        <div className="space-y-3">
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded-md" />
                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded-md" />
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full p-2 border rounded-md" />
                        </div>
                        
                        <button 
                            onClick={handlePlaceOrderClick}
                            disabled={loading}
                            className="w-full bg-red-500 text-white py-3 mt-4 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:bg-red-300"
                        >
                           {loading ? 'Placing Order...' : 'Place Order (COD)'}
                        </button>
                     </div>
                )}
            </div>
        </div>
    );
};

export default CartView;
