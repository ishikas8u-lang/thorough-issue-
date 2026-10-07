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
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
          Track Campus Report Progress
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
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
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Reference Code (e.g. CA-4912-K7)"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={isLoading}>
            <Search size={18} /> {isLoading ? 'Searching...' : 'Check Status'}
          </button>
        </div>
      </form>

      {/* Results View */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Querying facilities ledger...</p>
        </div>
      ) : reportResult ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                Report Reference
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                {reportResult.referenceCode}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Current Status
              </div>
              <span className={`badge badge-${STATUS_LABELS[reportResult.status].tone}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                {STATUS_LABELS[reportResult.status].label}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>Category</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                {CATEGORY_LABELS[reportResult.category]}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>Landmark Location</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                <MapPin size={16} color="var(--color-brand-accent)" />
                {reportResult.locationDescription}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>Logged At</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                <Clock size={16} />
                {new Date(reportResult.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Public Updates Timeline */}
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} color="var(--color-brand-accent)" /> Maintenance Progress & Public Updates
          </h3>

          {reportResult.updates.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
              <div style={{ position: 'absolute', top: '8px', bottom: '16px', left: '7px', width: '2px', background: '#cbd5e1' }} />
              {reportResult.updates.map((update, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.85rem',
                      top: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--color-brand-accent)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 1px #94a3b8',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className={`badge badge-${STATUS_LABELS[update.status].tone}`}>
                      {STATUS_LABELS[update.status].label}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--color-text-main)', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginTop: '0.35rem' }}>
                    {update.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No public maintenance notes posted yet. The report is awaiting staff inspection.
            </p>
          )}
        </div>
      ) : hasSearched ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Report Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', maxWidth: '440px', margin: '0 auto' }}>
            No report matching reference code <code>{searchedRef}</code> was found. Please ensure the code is spelled correctly (format: <code>CA-XXXX-XX</code>).
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '2rem' }}>
          Enter a reference code above to inspect progress.
        </div>
      )}
    </div>
  );
};
