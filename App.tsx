
import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from './services/firebase';
// FIX: Import 'onAuthStateChanged' for v9 syntax and combine type import.
import { onAuthStateChanged, type User } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import AuthPanel from './components/AuthPanel';
import HomeView from './components/HomeView';
import MenuView from './components/MenuView';
import OrdersView from './components/OrdersView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';
import CartView from './components/CartView';
import type { CartItem, CustomerProfile, Restaurant, PanelType } from './types';
import { Panel } from './types';


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState<PanelType>(Panel.Home);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [notification, setNotification] = useState<string>('');

    useEffect(() => {
        // FIX: Use Firebase v9 'onAuthStateChanged' function syntax.
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            if (!currentUser) {
                setCart([]);
                setCustomerProfile(null);
                setActivePanel(Panel.Home);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const customerRef = ref(db, `customers/${user.uid}`);
            const unsubscribe = onValue(customerRef, snapshot => {
                setCustomerProfile(snapshot.val() as CustomerProfile);
            });
            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        const notificationRef = ref(db, 'admin/notifications');
        const unsubscribe = onValue(notificationRef, (snapshot) => {
            const notifications = snapshot.val();
            if (notifications) {
                const latest = Object.values(notifications).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] as any;
                if (latest?.message) {
                    setNotification(`Global Announcement: ${latest.message}`);
                }
            } else {
                setNotification('');
            }
        });
        return () => unsubscribe();
    }, []);


    const handleViewMenu = useCallback((restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setActivePanel(Panel.Menu);
    }, []);
    
    const handleBackToRestaurants = () => {
        setSelectedRestaurant(null);
        setActivePanel(Panel.Home);
    };

    const handleAddToCart = (item: Omit<CartItem, 'quantity'>) => {
        if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
            if (!window.confirm(`Your cart has items from ${cart[0].restaurantName}. Clear it to add items from ${item.restaurantName}?`)) {
                return;
            }
            setCart([{ ...item, quantity: 1 }]);
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === item.id);
            if (existingItem) {
                return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };
    
    const handlePlaceOrder = () => {
        setCart([]);
        setIsCartVisible(false);
        setActivePanel(Panel.Orders);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading Foodie World...</div>
            </div>
        );
    }

    if (!user) {
        return <AuthPanel />;
    }

    return (
        <div className="pb-20">
            <header className="container mx-auto px-4 pt-4">
                <h1 className="text-3xl font-bold text-red-500">Foodie World</h1>
                {notification && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <span className="block sm:inline">{notification}</span>
                    </div>
                )}
            </header>

            <main className="container mx-auto px-4 mt-4">
                {activePanel === Panel.Home && <HomeView onViewMenu={handleViewMenu} />}
                {activePanel === Panel.Menu && selectedRestaurant && (
                    <MenuView 
                        restaurant={selectedRestaurant} 
                        onBack={handleBackToRestaurants}
                        onAddToCart={handleAddToCart}
                        cart={cart}
                        onViewCart={() => setIsCartVisible(true)}
                    />
                )}
                {activePanel === Panel.Orders && <OrdersView />}
                {activePanel === Panel.Profile && customerProfile && <ProfileView profile={customerProfile} />}
            </main>

            <CartView 
                isVisible={isCartVisible}
                onClose={() => setIsCartVisible(false)}
                cart={cart}
                setCart={setCart}
                customerProfile={customerProfile}
                onPlaceOrder={handlePlaceOrder}
            />

            <BottomNav activePanel={activePanel} setActivePanel={setActivePanel} />
        </div>
    );
};

export default App;