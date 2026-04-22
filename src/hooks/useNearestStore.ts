import { useCallback } from 'react';
import { useLocationStore, Branch } from '../store/useLocationStore';
import branchesData from '../data/branches.json';

export const branches: Branch[] = branchesData;

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const useStoreBranch = () => {
  const activeStore = useLocationStore((state) => state.activeStore);
  const distanceDisplay = useLocationStore((state) => state.distanceDisplay);
  const isAutoDetected = useLocationStore((state) => state.isAutoDetected);
  const isLoading = useLocationStore((state) => state.isLoading);
  const error = useLocationStore((state) => state.error);
  
  const setActiveStore = useLocationStore((state) => state.setActiveStore);
  const setIsLoading = useLocationStore((state) => state.setIsLoading);
  const setError = useLocationStore((state) => state.setError);

  const handleManualSelect = useCallback((branchId: string) => {
    const selected = branches.find((b) => b.id === branchId);
    if (selected) {
      setActiveStore(selected, null, false);
    }
  }, [setActiveStore]);

  const handleFindNearby = useCallback(() => {
    const defaultBranch = branches.find((b) => b.id === 'simba_town') || branches[0];

    const findClosestBranch = (userLat: number, userLon: number): { branch: Branch, distanceKm: number } => {
      let closest = branches[0];
      let minDistance = calculateDistance(userLat, userLon, closest.latitude, closest.longitude);

      for (let i = 1; i < branches.length; i++) {
        const currentDist = calculateDistance(userLat, userLon, branches[i].latitude, branches[i].longitude);
        if (currentDist < minDistance) {
          closest = branches[i];
          minDistance = currentDist;
        }
      }
      return { branch: closest, distanceKm: minDistance };
    };

    const formatDistance = (distKm: number) => {
      if (distKm < 1) {
        const meters = Math.round(distKm * 1000);
        return `${meters} m`;
      }
      return `${distKm.toFixed(1)} km`;
    };

    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setActiveStore(defaultBranch, null, false);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const closest = findClosestBranch(position.coords.latitude, position.coords.longitude);
        const distanceStr = formatDistance(closest.distanceKm);
        
        setActiveStore(closest.branch, distanceStr, true);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error / Permission denied:', err.message);
        setError(err.message);
        setActiveStore(defaultBranch, null, false); // Fallback on permission denied or error
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [setActiveStore, setIsLoading, setError]);

  return { activeStore, distanceDisplay, isAutoDetected, isLoading, error, handleFindNearby, handleManualSelect };
};
