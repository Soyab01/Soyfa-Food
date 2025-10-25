
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import type { Restaurant } from '../types';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-4 rounded-xl shadow-md cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
        <h3 className="text-lg font-bold text-red-500 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-600">{restaurant.cuisine || 'Mixed Cuisine'} | {restaurant.address || 'N/A'}</p>
        <p className="text-xs text-red-500 font-semibold mt-2">Tap to View Menu →</p>
    </div>
);

interface HomeViewProps {
    onViewMenu: (restaurant: Restaurant) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onViewMenu }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restaurantsRef = ref(db, 'restaurants');
        const unsubscribe = onValue(restaurantsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const approvedRestaurants = Object.keys(data)
                .map(id => ({ id, ...data[id] }))
                .filter(r => r.approved);
            setRestaurants(approvedRestaurants);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Approved Restaurants</h2>
            {loading ? (
                <p className="text-gray-500">Loading restaurants...</p>
            ) : restaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurants.map(r => (
                        <RestaurantCard key={r.id} restaurant={r} onClick={() => onViewMenu(r)} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No approved restaurants available at the moment.</p>
            )}
        </div>
    );
};

export default HomeView;
