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
        <div className="bg-gray-50 dark:bg-muted p-4 rounded-lg border border-gray-200 dark:border-border transition-all duration-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-foreground">{activeStore.name}</p>
            {isAutoDetected && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{t('nearest')}</span>}
          </div>
          <p className="text-base font-bold text-foreground opacity-90">{activeStore.locationNote}</p>
          <div className="flex items-center justify-between mt-2">
            {activeStore.mapUrl && (
              <a 
                href={activeStore.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {t('viewOnMap', 'View on Map')} ↗
              </a>
            )}
            {distanceDisplay && isAutoDetected && (
               <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                 <Crosshair className="w-4 h-4" />
                 {t('away', { count: distanceDisplay })}
               </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-base font-bold text-foreground opacity-90">
          {t('enableLocationMsg', 'Enable location to find the closest Simba Supermarket to you.')}
        </p>
      )}

      {error && (
        <div className="flex text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 p-3 rounded-lg text-sm font-bold items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="leading-snug">{error}. {t('defaultingToUTC', 'Defaulting to UTC branch.')}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 pt-2">
        <div>
          <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-1.5 block">{t('selectManually')}</label>
          <select 
            value={activeStore?.id || ''} 
            onChange={(e) => handleManualSelect(e.target.value)}
            className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border text-base text-foreground rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-[#F47A3E] focus:border-[#F47A3E] transition-all font-medium appearance-none shadow-sm cursor-pointer"
          >
            <option value="" disabled className="text-foreground bg-white">{t('chooseBranch')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id} className="text-foreground bg-white">{branch.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-200 dark:border-border" />
          <span className="text-sm text-foreground font-black uppercase tracking-widest opacity-50">{t('or')}</span>
          <hr className="flex-1 border-gray-200 dark:border-border" />
        </div>

        <button
          onClick={handleFindNearby}
          disabled={isLoading}
          className="w-full bg-[#F47A3E] text-white py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 hover:bg-[#D46A2E] disabled:opacity-50 transition-colors shadow-sm uppercase tracking-wide"
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
