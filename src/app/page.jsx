"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsRow from '../components/StatsRow';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { MAX_POLL_DURATION, EXTENDED_POLL_DURATION } from '../api/constants';

// App states: idle | running | complete | error
export default function Page() {
  const [appState, setAppState] = useState('idle');
  const [records, setRecords] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSync, setLastSync] = useState('');
  const [maxDuration, setMaxDuration] = useState(MAX_POLL_DURATION);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [procurementFilter, setProcurementFilter] = useState('');

  // Refs for cleanup
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const startPolling = useCallback(() => {
    const poll = async () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed > maxDuration) {
        clearInterval(elapsedRef.current);
        setErrorType('POLLING_TIMEOUT');
        setAppState('error');
        return;
      }

      try {
        const res = await fetch('/api/data', { signal: abortRef.current?.signal });
        if (!res.ok) throw new Error('Poll failed');
        const result = await res.json();

        if (result.status === 'COMPLETED') {
          clearInterval(elapsedRef.current);
          const body = result.data || [];
          if (body.length === 0) {
            setErrorType('EMPTY_DATA');
            setAppState('error');
          } else {
            setRecords(body);
            setLastSync(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
            setAppState('complete');
          }
          return;
        }

        if (result.status === 'ERRORED') {
          clearInterval(elapsedRef.current);
          setErrorType('WORKFLOW_ERROR');
          setAppState('error');
          return;
        }

        // Status is RUNNING or IDLE — continue polling
        timerRef.current = setTimeout(poll, 2000);
      } catch (err) {
        if (err.name === 'AbortError') return;
        clearInterval(elapsedRef.current);
        if (err.message.includes('NETWORK')) {
          setErrorType('NETWORK_ERROR');
        } else {
          setErrorType('WORKFLOW_ERROR');
        }
        setAppState('error');
      }
    };

    poll();
  }, [maxDuration]);

  // Start the workflow
  const startWorkflow = useCallback(async () => {
    // Reset state
    setAppState('running');
    setErrorType(null);
    setErrorMessage('');
    setElapsedMs(0);
    setMaxDuration(MAX_POLL_DURATION);

    // Start elapsed timer
    startTimeRef.current = Date.now();
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    elapsedRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);

    // Create abort controller
    abortRef.current = new AbortController();

    try {
      // Trigger the workflow using the internal API route
      const res = await fetch('/api/trigger', { method: 'POST', signal: abortRef.current.signal });
      if (!res.ok) throw new Error('Trigger failed');
      
      // Immediately start polling data route
      startPolling();
    } catch (err) {
      if (err.name === 'AbortError') return;
      clearInterval(elapsedRef.current);
      setErrorType('TRIGGER_FAILED');
      setAppState('error');
    }
  }, [startPolling]);

  // Error handlers
  const handleRetry = useCallback(() => {
    if (errorType === 'NETWORK_ERROR') {
      // Resume polling
      setAppState('running');
      setErrorType(null);
      startTimeRef.current = Date.now();
      elapsedRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 500);
      abortRef.current = new AbortController();
      startPolling();
    } else {
      startWorkflow();
    }
  }, [errorType, startPolling, startWorkflow]);

  const handleKeepWaiting = useCallback(() => {
    setMaxDuration((prev) => prev + EXTENDED_POLL_DURATION);
    setAppState('running');
    setErrorType(null);
    startTimeRef.current = Date.now() - elapsedMs; // keep cumulative elapsed
    elapsedRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);
    abortRef.current = new AbortController();
    startPolling();
  }, [elapsedMs, startPolling]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setAppState('idle');
    setErrorType(null);
  }, []);

  const handleResync = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    
    setAppState('idle');
    setRecords([]);
    
    try {
        await fetch('/api/reset', { method: 'POST' });
    } catch (e) {
        console.error('Failed to reset', e);
    }
    startWorkflow();
  }, [startWorkflow]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    if (!records.length) return [];
    return records.filter((r) => {
      // Search query across all string fields
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
                onRetry={handleRetry}
                onKeepWaiting={handleKeepWaiting}
                onCancel={handleCancel}
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
