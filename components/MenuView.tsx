
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import type { Restaurant, MenuItem, CartItem } from '../types';
import { CartIcon } from './icons';

interface MenuItemCardProps {
    item: MenuItem;
    onAddToCart: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => (
    <div className="flex items-center bg-white p-3 mb-3 rounded-xl shadow-sm">
        <img 
            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/70`} 
            className="w-20 h-20 rounded-lg object-cover mr-4 flex-shrink-0" 
            alt={item.name} 
        />
        <div className="flex-grow">
            <h4 className="font-bold text-gray-800">{item.name}</h4>
            <p className="text-xs text-gray-500 my-1">{item.description || 'No description'}</p>
            <div className="font-semibold text-red-500">₹{item.price.toFixed(2)}</div>
        </div>
        <button 
            onClick={onAddToCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors ml-4 flex-shrink-0"
        >
            + Add
        </button>
    </div>
);


interface MenuViewProps {
    restaurant: Restaurant;
    onBack: () => void;
    onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
    cart: CartItem[];
    onViewCart: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({ restaurant, onBack, onAddToCart, cart, onViewCart }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const cartTotal = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal > 0 ? subtotal + 50.00 : 0; // 50 is delivery fee
    }, [cart]);

    useEffect(() => {
        const menuRef = ref(db, `menus/${restaurant.id}`);
        const unsubscribe = onValue(menuRef, (snapshot) => {
            const data = snapshot.val() || {};
            const availableItems = Object.keys(data)
                .map(id => ({ id, ...data[id] }))
                .filter(item => item.available !== false);
            setMenuItems(availableItems);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurant.id]);

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{restaurant.name}</h2>
                <p className="text-gray-500">{restaurant.cuisine}</p>
            </div>
            {loading ? (
                <p>Loading menu items...</p>
            ) : menuItems.length > 0 ? (
                <div className="space-y-3">
                    {menuItems.map(item => (
                        <MenuItemCard 
                            key={item.id} 
                            item={item} 
                            onAddToCart={() => onAddToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name
                            })} 
                        />
                    ))}
                </div>
            ) : (
                <p>No menu items available from this restaurant.</p>
            )}
            <div className="sticky bottom-20 mt-6 grid grid-cols-2 gap-4">
                <button onClick={onBack} className="bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                    ← Back
                </button>
                 <button onClick={onViewCart} className="bg-red-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center">
                    <CartIcon className="w-5 h-5 mr-2" />
                    View Cart (₹{cartTotal.toFixed(2)})
                </button>
            </div>
        </div>
    );
};

export default MenuView;
