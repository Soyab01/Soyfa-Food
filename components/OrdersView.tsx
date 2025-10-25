
import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import type { Order, Restaurant, DeliveryPartner, OrderStatus } from '../types';

const getStatusClass = (status: OrderStatus) => {
    switch (status) {
        case 'PLACED': return 'bg-blue-100 text-blue-800';
        case 'ACCEPTED': return 'bg-yellow-100 text-yellow-800';
        case 'PREPARING': return 'bg-green-100 text-green-800';
        case 'READY_FOR_PICKUP': return 'bg-orange-100 text-orange-800';
        case 'PICKED_UP':
        case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
        case 'DELIVERED': return 'bg-cyan-100 text-cyan-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const OrderCard: React.FC<{ order: Order; restaurantName: string; deliveryBoyName: string; onReorder: (orderId: string) => void; customerName: string;}> = ({ order, restaurantName, deliveryBoyName, onReorder, customerName }) => {
    const [reviewText, setReviewText] = useState('');
    
    const submitReview = async () => {
        if (!reviewText.trim()) {
            alert('Please write a review before submitting.');
            return;
        }
        const reviewData = {
            review: reviewText,
            timestamp: new Date().toISOString(),
            customerName: customerName || 'Anonymous',
        };
        try {
            await update(ref(db, `orders/${order.orderId}`), reviewData);
            alert('Review submitted successfully!');
        } catch (error: any) {
            alert('Failed to submit review: ' + error.message);
        }
    };

    const itemsSummary = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
    const date = new Date(order.createdAt).toLocaleDateString();

    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-gray-800">Order #{order.orderId.substring(0, 8)}</h4>
                    <p className="text-xs text-gray-500">From: <strong>{restaurantName}</strong> | {date}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(order.status)}`}>
                    {order.status.replace('_', ' ')}
                </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Items: {itemsSummary}</p>
            <p className="font-bold text-red-500 mb-2">Total: ₹{order.totalAmount.toFixed(2)} ({order.paymentMethod})</p>
            
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.deliveryUid && (
                 <p className="text-sm">Delivery by: <strong>{deliveryBoyName}</strong></p>
            )}
            
            {(order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY') && order.locationLink && (
                 <a href={order.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold">Track Delivery Live</a>
            )}

            {order.status === 'DELIVERED' && !order.review && (
                <div className="mt-4 border-t pt-3">
                    <textarea 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Leave a review..."
                        className="w-full p-2 border rounded-lg text-sm"
                    />
                    <button onClick={submitReview} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg mt-2 hover:bg-red-600">
                        Submit Review
                    </button>
                </div>
            )}
            {order.status === 'DELIVERED' && order.review && (
                <p className="text-sm text-green-600 mt-2 font-semibold">✓ Review Submitted</p>
            )}

            {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                <button onClick={() => onReorder(order.orderId)} className="bg-gray-200 text-gray-800 text-sm font-bold py-2 px-4 rounded-lg mt-4 hover:bg-gray-300">
                    Reorder
                </button>
            )}
        </div>
    );
};

const OrdersView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantsCache, setRestaurantsCache] = useState<Record<string, Restaurant>>({});
    const [deliveryCache, setDeliveryCache] = useState<Record<string, DeliveryPartner>>({});
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            const resSnapshot = await get(ref(db, 'restaurants'));
            setRestaurantsCache(resSnapshot.val() || {});
            
            const deliverySnapshot = await get(ref(db, 'deliveryPartners'));
            setDeliveryCache(deliverySnapshot.val() || {});
        };

        fetchInitialData();

        const customerUid = auth.currentUser?.uid;
        if (customerUid) {
             const customerRef = ref(db, `customers/${customerUid}/name`);
            get(customerRef).then(snapshot => {
                if (snapshot.exists()) {
                    setCustomerName(snapshot.val());
                }
            });

            const ordersRef = ref(db, 'orders');
            const unsubscribe = onValue(ordersRef, (snapshot) => {
                const allOrders = snapshot.val() || {};
                const customerOrders = Object.values(allOrders)
                    .filter((o: any) => o.customerUid === customerUid)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(customerOrders as Order[]);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const handleReorder = useCallback((orderId: string) => {
        alert(`Reordering is not yet implemented in this view. Order ID: ${orderId}`);
        // In a full implementation, this would likely interact with the global cart state
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>
            {loading ? (
                <p>Loading order history...</p>
            ) : orders.length > 0 ? (
                orders.map(order => (
                    <OrderCard 
                        key={order.orderId} 
                        order={order}
                        restaurantName={restaurantsCache[order.restaurantId]?.name || 'Unknown Restaurant'}
                        deliveryBoyName={deliveryCache[order.deliveryUid]?.name || 'Awaiting Assignment'}
                        onReorder={handleReorder}
                        customerName={customerName}
                    />
                ))
            ) : (
                <p>You have not placed any orders yet.</p>
            )}
        </div>
    );
};

export default OrdersView;
