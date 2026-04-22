import { useStoreBranch, branches } from '../hooks/useNearestStore';
import { MapPin, Loader2, AlertCircle, Crosshair } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BranchLocator() {
  const { t } = useTranslation();
  const { activeStore, distanceDisplay, isAutoDetected, isLoading, error, handleFindNearby, handleManualSelect } = useStoreBranch();

  return (
    <div className="bg-white dark:bg-card border dark:border-border rounded-xl p-5 shadow-sm w-full mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-full">
          <MapPin className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{t('preferredBranch')}</h3>
      </div>

      {activeStore ? (
        <div className="bg-gray-50 dark:bg-muted p-3.5 rounded-lg border-2 border-gray-400 dark:border-gray-600 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">{activeStore.name}</p>
            {isAutoDetected && <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-0.5 rounded uppercase tracking-wider">{t('nearest')}</span>}
          </div>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">{activeStore.locationNote}</p>
          {distanceDisplay && isAutoDetected && (
             <p className="text-sm font-bold text-primary mt-1.5 flex items-center gap-1.5">
               <Crosshair className="w-4 h-4" />
               {t('away', { count: distanceDisplay })}
             </p>
          )}
        </div>
      ) : (
        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('enableLocationMsg', 'Enable location to find the closest Simba Supermarket to you.')}
        </p>
      )}

      {error && (
        <div className="flex text-amber-700 bg-amber-50 border-2 border-amber-200 dark:bg-amber-950/30 p-3 rounded-lg text-sm font-medium items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="leading-snug">{error}. {t('defaultingToUTC', 'Defaulting to UTC branch.')}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5 block">{t('selectManually')}</label>
          <select 
            value={activeStore?.id || ''} 
            onChange={(e) => handleManualSelect(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 text-base text-black dark:text-white rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium appearance-none"
          >
            <option value="" disabled className="text-gray-900 bg-white checked:bg-orange-500 checked:text-white">{t('chooseBranch')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id} className="text-gray-900 bg-white hover:bg-orange-500 hover:text-white checked:bg-orange-500 checked:text-white">{branch.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider">{t('or')}</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
        </div>

        <button
          onClick={handleFindNearby}
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('calculating')}
            </>
          ) : (
            <>
              <Crosshair className="w-5 h-5" />
              {t('autoDetect')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
