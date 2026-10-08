import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { IReportRepository } from '../../application/interfaces';
import { PublicReportPresenter } from '../../infrastructure/repositories';
import type { PublicReportView } from '../../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../types';

interface LookupViewProps {
  reportRepository: IReportRepository;
  initialRefCode?: string;
}

export const LookupView: React.FC<LookupViewProps> = ({ reportRepository, initialRefCode }) => {
  const [refInput, setRefInput] = useState(initialRefCode || '');
  const [searchedRef, setSearchedRef] = useState<string | null>(initialRefCode || null);
  const [reportResult, setReportResult] = useState<PublicReportView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const presenter = new PublicReportPresenter();

  const handleLookup = async (codeToSearch: string) => {
    const clean = codeToSearch.trim().toUpperCase();
    if (!clean) return;

    setIsLoading(true);
    setHasSearched(true);
    setSearchedRef(clean);

    try {
      const found = await reportRepository.findByReference(clean);
      if (found) {
        setReportResult(presenter.present(found));
      } else {
        setReportResult(null);
      }
    } catch {
      setReportResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRefCode) {
      handleLookup(initialRefCode);
    }
  }, [initialRefCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(refInput);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem', maxWidth: '780px' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="title-section">
          Track Campus Report Progress
        </h1>
        <p className="text-lead" style={{ marginTop: '0.45rem' }}>
          Query your reference code to view sanitized status updates and maintenance progress.
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Reference Code (e.g. CA-4912-K7)"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            style={{
              flex: '1 1 220px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
            aria-label="Reference Code"
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: '0 0 auto', minHeight: '44px' }}
            disabled={isLoading}
            title="Check ticket status"
          >
            <Search size={18} />
            <span>{isLoading ? 'Searching...' : 'Check Status'}</span>
          </button>
        </div>
      </form>

      {/* Results View */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p className="text-body-muted">Querying facilities ledger...</p>
        </div>
      ) : reportResult ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.6rem',
            boxShadow: 'var(--shadow-md)',
            minWidth: 0,
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', minWidth: 0 }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                Report Reference
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-brand-primary)', overflowWrap: 'anywhere' }}>
                {reportResult.referenceCode}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', marginBottom: '0.35rem' }}>
                Current Status
              </div>
              <span className={`badge badge-${STATUS_LABELS[reportResult.status].tone}`} style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.75rem' }}>
                {STATUS_LABELS[reportResult.status].label}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                Category
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.2rem', fontSize: 'var(--text-sm)' }}>
                {CATEGORY_LABELS[reportResult.category]}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                Landmark Location
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)', fontWeight: 600, marginTop: '0.2rem', fontSize: 'var(--text-sm)', overflowWrap: 'anywhere' }}>
                <MapPin size={15} color="var(--color-brand-accent)" style={{ flexShrink: 0 }} />
                <span>{reportResult.locationDescription}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                Logged At
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.2rem' }}>
                <Clock size={15} style={{ flexShrink: 0 }} />
                <span>{new Date(reportResult.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Public Updates Timeline */}
          <h3 className="title-card" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <CheckCircle2 size={19} color="var(--color-brand-accent)" /> Maintenance Progress &amp; Public Updates
          </h3>

          {reportResult.updates.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: '1.5rem', marginLeft: '0.4rem', minWidth: 0 }}>
              <div style={{ position: 'absolute', top: '8px', bottom: '16px', left: '6px', width: '2px', background: '#c8baa7' }} />
              {reportResult.updates.map((update, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem', minWidth: 0 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.65rem',
                      top: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: 'var(--color-brand-accent)',
                      border: '3px solid #fdfbf7',
                      boxShadow: '0 0 0 1px #b8a698',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${STATUS_LABELS[update.status].tone}`}>
                      {STATUS_LABELS[update.status].label}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-main)', background: 'var(--color-surface-subtle)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: '0.35rem', lineHeight: 'var(--leading-relaxed)' }}>
                    {update.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', background: 'var(--color-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              No public maintenance notes posted yet. The report is awaiting Admin Block inspection.
            </p>
          )}
        </div>
      ) : hasSearched ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            minWidth: 0,
          }}
        >
          <AlertCircle size={38} color="#948177" style={{ margin: '0 auto 0.75rem' }} />
          <h3 className="title-card" style={{ marginBottom: '0.45rem' }}>No Report Found</h3>
          <p className="text-body-muted" style={{ maxWidth: '440px', margin: '0 auto', fontSize: 'var(--text-sm)' }}>
            No report matching reference code <code>{searchedRef}</code> was found. Please ensure the code is spelled correctly (format: <code>CA-XXXX-XX</code>).
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '2rem', fontSize: 'var(--text-sm)' }}>
          Enter a reference code above to inspect progress.
        </div>
      )}
    </div>
  );
};
