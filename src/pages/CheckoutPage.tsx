import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Lock, Loader2, MapPin, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useStoreBranch } from '../hooks/useNearestStore';
import { getLocalizedProductName } from '../lib/localize';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { activeStore } = useStoreBranch();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [momoPhone, setMomoPhone] = useState('078');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  // Google Maps and Location State
  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.9441, lng: 30.0619 }); // Kigali default
  const [markerPos, setMarkerPos] = useState<{lat: number, lng: number} | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const res = await geocoder.geocode({ location: { lat, lng } });
        if (res.results && res.results[0]) {
          setAddress(res.results[0].formatted_address);
          return;
        }
      } catch (err) {
        console.error("Google Geocoding failed:", err);
      }
    }
    
    // Fallback to OSM Nominatim if Google fails or is missing an API key
    try {
       const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
       const data = await res.json();
       if (data && data.display_name) {
         setAddress(data.display_name);
       }
    } catch (e) {
       console.error("Nominatim Geocoding failed:", e);
       alert(t('locationError'));
    }
  };

  const handleGetLocation = () => {
      if (!navigator.geolocation) {
        alert(t('locationError'));
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await reverseGeocode(latitude, longitude);
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          setIsLocating(false);
          alert(t('locationError'));
        }
      );
  };

  if (items.length === 0 && orderStatus !== 'success') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground">
        <h2 className="text-2xl font-bold mb-4">{t('emptyCart')}</h2>
        <button onClick={() => navigate('/shop')} className="bg-primary text-white px-6 py-2 rounded-lg">
          {t('shop')}
        </button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoPhone || !address || !currentUser) return;
    
    setIsProcessing(true);
    setOrderStatus('pending');

    try {
      // Save Order to Firestore
      const orderPayload = {
        userId: currentUser.uid,
        branchId: activeStore?.id || 'simba_town', // Persists the selected branch id
        customerPhone: momoPhone,
        deliveryAddress: address,
        totalAmount: getCartTotal(),
        status: 'pending',
        items: items.map(item => ({ 
          id: item.id, 
          quantity: item.quantity, 
          price: item.price,
          name: item.name,
          image: item.image
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Sending order payload to Firestore:', orderPayload);
      await addDoc(collection(db, 'orders'), orderPayload);

      // Simulate MoMo Webhook delay for the UI
      setTimeout(() => {
        setIsProcessing(false);
        setOrderStatus('success');
        clearCart();
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      setIsProcessing(false);
      setOrderStatus('idle');
      alert("There was an error processing your order. Please try again.");
    }
  };

  if (orderStatus === 'success') {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-foreground flex flex-col items-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
           <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black font-serif mb-4">{t('orderSuccess')}</h1>
        <p className="text-gray-900 dark:text-white text-lg max-w-md mx-auto mb-8 font-black">
          {t('thankYouShopping')}
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-primary/90 transition"
        >
          {t('home')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 dark:bg-background min-h-screen py-12 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">{t('deliveryDetails')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-bold mb-1 text-gray-900 dark:text-gray-100">{t('fullName')}</label>
                  <input type="text" className="w-full border-2 border-gray-400 dark:border-gray-500 rounded-xl p-3 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#F47A3E]" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-base font-bold mb-1 text-gray-900 dark:text-gray-100">{t('deliveryAddressKigali')}</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      className="flex-1 border-2 border-gray-400 dark:border-gray-500 rounded-xl p-3 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#F47A3E]" 
                      placeholder="e.g. KG 11 Ave, Nyarutarama" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required 
                    />
                    <button 
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                      {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>📍 {t('getLocation')}</span>}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button 
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                       {t('openMap')}
                    </button>
                  </div>
                </div>

                {showMapModal && (
                  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('selectOnMap')}</h3>
                        <button onClick={() => setShowMapModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-100">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('mapFallbackText')}</p>
                      
                      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative">
                        {isLoaded ? (
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={mapCenter}
                            zoom={13}
                            onClick={(e) => {
                              if (e.latLng) {
                                  setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                              }
                            }}
                          >
                            {markerPos && <Marker position={markerPos} />}
                          </GoogleMap>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                             <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                             <span className="text-gray-500 font-bold uppercase">{t('locating')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-end gap-3">
                          <button type="button" onClick={() => setShowMapModal(false)} className="px-4 py-2 rounded-xl font-bold dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{t('goBack', 'Go Back')}</button>
                          <button 
                            type="button" 
                            onClick={async () => {
                              if (markerPos) {
                                setShowMapModal(false);
                                setIsLocating(true);
                                await reverseGeocode(markerPos.lat, markerPos.lng);
                                setIsLocating(false);
                              }
                            }}
                            disabled={!markerPos || isLocating}
                            className="bg-[#F47A3E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#D46A2E] disabled:opacity-50 transition flex items-center gap-2"
                          >
                            {isLocating ? <Loader2 className="w-5 h-5 animate-spin"/> : t('confirmLocation')}
                          </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fulfillment Branch */}
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {t('orderFulfillment', 'Order Fulfillment')}
              </h2>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
                <div className="bg-primary/10 text-primary p-2 rounded-full mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-black dark:text-white text-lg">
                    {activeStore ? activeStore.name : t('simbaUTC', 'Simba UTC (Town)')}
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-0.5 font-bold">
                    {activeStore ? activeStore.locationNote : t('defaultBranch', 'Default Branch')}
                  </p>
                  <p className="text-sm font-black text-primary mt-2 uppercase tracking-widest underline decoration-primary/30">
                    {t('dispatchingFromHere', 'Picking up & Dispatching from here')}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {t('paymentMethod')}
                <Lock className="w-4 h-4 text-muted-foreground" />
              </h2>
              
              <div className="border-2 border-primary bg-primary/5 rounded-xl p-4 flex gap-4 relative">
                <input type="radio" checked readOnly className="mt-1" />
                <div>
                  <h3 className="font-bold">MTN Mobile Money (MoMo)</h3>
                  <p className="text-sm text-[#333333] dark:text-gray-300 font-normal mt-1">{t('payQuickly')}</p>
                </div>
                {/* Mock momo badge */}
                <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 font-bold text-sm px-2 py-1 rounded">MoMo</div>
              </div>

              <form onSubmit={handleCheckout} className="mt-6">
                <label className="block text-base font-bold mb-1 text-gray-900 dark:text-gray-100">{t('momoPhone')}</label>
                <input 
                  type="text" 
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  className="w-full border dark:border-border rounded-xl p-3 font-mono text-lg bg-transparent" 
                  required
                  placeholder="078 XXXXXXX"
                />
                
                {orderStatus === 'pending' && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl flex items-center justify-center gap-3 font-medium border border-blue-100 dark:border-blue-800">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('paymentPending')}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="mt-6 w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : t('payWithMomo')} 
                  {!isProcessing && <ChevronRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
            
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-4 border-b dark:border-border pb-4">{t('orderSummary')}</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded border dark:border-border shrink-0 flex items-center justify-center relative">
                      <img src={item.image} alt={getLocalizedProductName(item)} className="w-full h-full object-cover rounded" />
                      <span className="absolute -top-2 -right-2 bg-muted-foreground text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-2 font-medium leading-tight">{getLocalizedProductName(item)}</p>
                      <p className="text-muted-foreground mt-1">{t('priceRwf', { price: (item.price * item.quantity).toLocaleString() })}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm border-t dark:border-border pt-4 text-muted-foreground">
                 <div className="flex justify-between">
                   <span>{t('subtotal')}</span>
                   <span>{t('priceRwf', { price: getCartTotal().toLocaleString() })}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>{t('delivery')}</span>
                   <span>{t('free')}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-foreground border-t dark:border-border pt-4">
                   <span>{t('total')}</span>
                   <span className="text-primary">{t('priceRwf', { price: getCartTotal().toLocaleString() })}</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
