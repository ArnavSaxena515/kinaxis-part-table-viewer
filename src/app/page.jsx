"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsRow from '../components/StatsRow';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Page() {
  const [appState, setAppState] = useState('idle'); // idle | running | complete | error
  const [records, setRecords] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSync, setLastSync] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [procurementFilter, setProcurementFilter] = useState('');

  const startTimeRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const lastStateRef = useRef('idle');
  const recordsRef = useRef([]);

  // Continuous polling effect: "always be listening for incoming data"
  useEffect(() => {
    let isSubscribed = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Poll failed');
        const result = await res.json();
        
        if (!isSubscribed) return;

        if (result.status === 'COMPLETED') {
          const newRecords = result.data || [];
          
          // Render dashboard immediately with new data
          setRecords(newRecords);
          recordsRef.current = newRecords;
          
          if (lastStateRef.current !== 'complete') {
            setLastSync(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
            setAppState('complete');
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          }
          lastStateRef.current = 'complete';

        } else if (result.status === 'RUNNING') {
          if (lastStateRef.current !== 'running') {
            setAppState('running');
            setErrorType(null);
            startTimeRef.current = Date.now();
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
            elapsedTimerRef.current = setInterval(() => {
              setElapsedMs(Date.now() - startTimeRef.current);
            }, 500);
          }
          lastStateRef.current = 'running';

        } else if (result.status === 'ERRORED') {
          if (lastStateRef.current !== 'error') {
            setAppState('error');
            setErrorType('WORKFLOW_ERROR');
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          }
          lastStateRef.current = 'error';

        } else {
          // IDLE state
          if (lastStateRef.current !== 'idle' && lastStateRef.current !== 'complete') {
            setAppState('idle');
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          }
          // If it was complete, but Redis expired, we might transition to IDLE or we can keep the old data showing.
          // The prompt says "If status is RUNNING or IDLE, show the empty state".
          // If we transition to IDLE, we should clear.
          if (lastStateRef.current !== 'idle' && result.status === 'IDLE') {
             setAppState('idle');
             setRecords([]);
             recordsRef.current = [];
          }
          lastStateRef.current = 'idle';
        }
      } catch (err) {
        // Silently ignore network errors during continuous background polling 
        console.error('Polling error', err);
      }
    };

    // Poll immediately on mount, then every 3 seconds
    poll();
    const intervalId = setInterval(poll, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Button triggers
  const startWorkflow = useCallback(async () => {
    // 1. Optimistic UI update
    setAppState('running');
    setErrorType(null);
    startTimeRef.current = Date.now();
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);
    lastStateRef.current = 'running';
    
    try {
      // 2. Clear stale data via reset
      await fetch('/api/reset', { method: 'POST' });
      // 3. Trigger workflow
      const res = await fetch('/api/trigger', { method: 'POST' });
      if (!res.ok) throw new Error('Trigger failed');
    } catch (err) {
      console.error(err);
      setErrorType('TRIGGER_FAILED');
      setAppState('error');
      lastStateRef.current = 'error';
    }
  }, []);

  const handleResync = useCallback(() => {
    setRecords([]);
    recordsRef.current = [];
    setSearchQuery('');
    setTypeFilter('');
    setSiteFilter('');
    setProcurementFilter('');
    startWorkflow();
  }, [startWorkflow]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    if (!records.length) return [];
    return records.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchFields = [r.Name, r.Type, r.UOM, r.ProductGroup, r.Division, r.Site, r.MRPType, r.ProcurementType];
        const match = searchFields.some((f) => f && String(f).toLowerCase().includes(q));
        if (!match) return false;
      }
      if (typeFilter && r.Type !== typeFilter) return false;
      if (siteFilter && r.Site !== siteFilter) return false;
      if (procurementFilter && r.ProcurementType !== procurementFilter) return false;
      return true;
    });
  }, [records, searchQuery, typeFilter, siteFilter, procurementFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setTypeFilter('');
    setSiteFilter('');
    setProcurementFilter('');
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />

      <main className="md:ml-64 min-h-screen flex flex-col">
        <Header
          appState={appState}
          recordCount={records.length}
          lastSync={lastSync}
          onResync={handleResync}
        />

        <div className="flex-1 p-8 space-y-8 bg-surface">
          {/* Stats row — always show */}
          <StatsRow records={appState === 'complete' ? filteredRecords : []} />

          {/* IDLE state — Run Harmonization button */}
          {appState === 'idle' && (
            <section className="bg-white">
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span
                  className="material-symbols-outlined text-6xl text-surface-container-high mb-6"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                >
                  sync
                </span>
                <button
                  onClick={startWorkflow}
                  className="px-10 py-4 text-sm font-black uppercase tracking-widest text-on-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #b90027, #e31937)' }}
                >
                  Run Harmonization
                </button>
                <p className="mt-4 text-[11px] text-on-surface-variant max-w-md leading-relaxed">
                  Pull materials from SAP S/4HANA and harmonize to Kinaxis Maestro schema
                </p>
              </div>
            </section>
          )}

          {/* RUNNING state — Loading */}
          {appState === 'running' && (
            <section className="bg-white">
              <LoadingState elapsedMs={elapsedMs} />
            </section>
          )}

          {/* ERROR state */}
          {appState === 'error' && (
            <section className="bg-white">
              <ErrorState
                errorType={errorType}
                errorMessage={errorMessage}
                onRetry={startWorkflow}
                onKeepWaiting={() => {
                  setAppState('running');
                  lastStateRef.current = 'running';
                }}
                onCancel={() => {
                  setAppState('idle');
                  lastStateRef.current = 'idle';
                }}
              />
            </section>
          )}

          {/* COMPLETE state — Filter bar + Data table */}
          {appState === 'complete' && (
            <>
              <FilterBar
                records={records}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                siteFilter={siteFilter}
                setSiteFilter={setSiteFilter}
                procurementFilter={procurementFilter}
                setProcurementFilter={setProcurementFilter}
                filteredCount={filteredRecords.length}
                totalCount={records.length}
                onClear={clearFilters}
              />
              <DataTable records={filteredRecords} />
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white py-4 px-8 w-full flex flex-wrap justify-between items-center z-30" style={{ borderTop: '1px solid #e8e8ea' }}>
          <div className="flex items-center gap-6 flex-wrap">
            <p className="text-[11px] tracking-wide uppercase text-zinc-500">
              © Kinaxis &amp; SAP S/4HANA Integration. Architectural Precisionist v1.0
            </p>
            <div className="flex items-center gap-4">
              <a className="text-[11px] tracking-wide uppercase text-zinc-500 hover:text-charcoal transition-colors" href="#">Documentation</a>
              <a className="text-[11px] tracking-wide uppercase text-zinc-500 hover:text-charcoal transition-colors" href="#">API Status</a>
              <a className="text-[11px] tracking-wide uppercase text-zinc-500 hover:text-charcoal transition-colors" href="#">Support</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Powered by Refold AI</span>
            <div className="px-2 py-0.5 bg-surface-container text-charcoal text-[9px] font-bold">API v1.2.4</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
