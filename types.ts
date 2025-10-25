
export enum Panel {
    Home = 'home',
    Menu = 'menu',
    Orders = 'orders',
    Profile = 'profile',
}
export type PanelType = Panel.Home | Panel.Menu | Panel.Orders | Panel.Profile;

export interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    address: string;
    approved: boolean;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    available: boolean;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
}

export interface OrderItem {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
    orderId: string;
    customerUid: string;
    restaurantId: string;
    deliveryUid: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    customerName: string;
    address: string;
    phone: string;
    paymentMethod: 'COD';
    status: OrderStatus;
    locationLink?: string;
    createdAt: string;
    updatedAt: string;
    review?: string;
}

export interface CustomerProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface DeliveryPartner {
    name: string;
}
