import { useMemo, useState } from 'react';
import { ROLE_CATALOG } from '../data/roleFactory';
import { INDUSTRIES } from '../data/interviewRoles';
import type { Role } from '../types';

interface Props {
  selected: Role | null;
  onSelect: (role: Role) => void;
  onNext: () => void;
}

export default function RoleSelect({ selected, onSelect, onNext }: Props) {
  const [industry, setIndustry] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      ROLE_CATALOG.filter(
        (c) =>
          (industry === 'All' || c.industry === industry) &&
          (search === '' || c.role.title.toLowerCase().includes(search.toLowerCase())),
      ).sort((a, b) => Number(b.featured) - Number(a.featured)),
    [industry, search],
  );

  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Step 1 · Choose Dream Role</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">What's your dream role?</h1>
        <p className="mt-2 text-slate-500">
          {ROLE_CATALOG.length} real-world roles across engineering, data, HR, finance, healthcare, government and more.
          Your entire roadmap, projects, and interview prep will be tailored to this role.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${ROLE_CATALOG.length} roles…`}
          aria-label="Search dream roles"
          className="w-full max-w-xs rounded-full border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        {['All', ...INDUSTRIES].map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            aria-pressed={industry === ind}
            className={`rounded-full px-4 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
              industry === ind
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs font-semibold text-slate-400" aria-live="polite">
        {filtered.length} role{filtered.length !== 1 ? 's' : ''} {industry !== 'All' ? `in ${industry}` : 'available'}
        {search && ` matching “${search}”`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="listbox" aria-label="Dream roles">
        {filtered.map(({ role, industry: ind, featured }) => {
          const isSelected = selected?.id === role.id;
          return (
            <button
              key={role.id}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(role)}
              className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                isSelected ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white shadow-lg" aria-hidden="true">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-xl shadow-md`} aria-hidden="true">
                  {role.icon}
                </div>
                {featured && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">⭐ DEEP-DIVE PATH</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900">{role.title}</h3>
              <p className="mt-0.5 text-xs text-slate-400">{ind}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">

                <span className="badge badge-amber">🔥 {role.demand}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{role.skills.length} skills</span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            No roles match your search. Try a different keyword or industry.
          </p>
        )}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-300 transition enabled:hover:scale-105 enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
        >
          {selected ? `Start Assessment for ${selected.title} →` : 'Select a role to continue'}
        </button>
      </div>
    </div>
  );
}
