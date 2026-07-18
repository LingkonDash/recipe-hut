'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─────────────────────────── Constants ─────────────────────────── */

const CATEGORIES = [
  'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack',
  'Dessert', 'Appetizer', 'Soup', 'Salad', 'Beverage', 'Side Dish',
];

const CUISINES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian',
  'French', 'Thai', 'Mediterranean', 'Greek', 'Spanish', 'Korean',
  'Middle Eastern', 'British', 'Caribbean', 'African', 'Other',
];

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Hard', value: 3 },
];

/* ──────────────────────── Form State Types ─────────────────────── */

interface FormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  ingredients: string[];
  steps: string[];
  category: string;
  cuisine: string;
  prepTimeMinutes: string;
  cookTimeMinutes: string;
  servings: string;
  priority: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  imageUrl: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  ingredients: [''],
  steps: [''],
  category: '',
  cuisine: '',
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  servings: '',
  priority: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  imageUrl: '',
};

/* ──────────────────────── Validation ───────────────────────────── */

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) errors.title = 'Title is required.';

  if (!form.shortDescription.trim()) {
    errors.shortDescription = 'Short description is required.';
  } else if (form.shortDescription.length > 150) {
    errors.shortDescription = 'Short description must be 150 characters or fewer.';
  }

  if (!form.fullDescription.trim()) errors.fullDescription = 'Full description is required.';

  const validIngredients = form.ingredients.filter((i) => i.trim() !== '');
  if (validIngredients.length === 0) errors.ingredients = 'Add at least one ingredient.';

  const validSteps = form.steps.filter((s) => s.trim() !== '');
  if (validSteps.length === 0) errors.steps = 'Add at least one step.';

  if (!form.category) errors.category = 'Please select a category.';
  if (!form.cuisine) errors.cuisine = 'Please select a cuisine.';
  if (!form.priority) errors.priority = 'Please select a difficulty level.';

  const numFields: (keyof FormData)[] = [
    'prepTimeMinutes', 'cookTimeMinutes', 'servings', 'calories', 'protein', 'carbs', 'fat',
  ];
  for (const field of numFields) {
    const val = Number(form[field]);
    if (form[field] === '') {
      errors[field] = 'This field is required.';
    } else if (isNaN(val) || val < 0) {
      errors[field] = 'Must be a non-negative number.';
    } else if (field === 'servings' && val < 1) {
      errors[field] = 'Must be at least 1.';
    }
  }

  if (form.imageUrl.trim() !== '') {
    try {
      new URL(form.imageUrl.trim());
    } catch {
      errors.imageUrl = 'Must be a valid URL (e.g. https://example.com/image.jpg).';
    }
  }

  return errors;
}

/* ──────────────────────── Sub-components ───────────────────────── */

function FieldLabel({
  htmlFor, children, hint,
}: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
      {children}
      {hint && <span className="ml-1.5 font-normal text-zinc-400 text-xs">{hint}</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {msg}
    </p>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-[var(--foreground)] bg-zinc-50 dark:bg-zinc-800/60 
   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all
   placeholder:text-zinc-400 ${
    hasError
      ? 'border-red-400 dark:border-red-500'
      : 'border-zinc-200 dark:border-zinc-700'
  }`;

/* ──────────────────────── Main Component ───────────────────────── */

export function AddRecipeForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  /* ── Field helpers ── */
  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  /* ── Dynamic list helpers ── */
  const addRow = (key: 'ingredients' | 'steps') =>
    setForm((f) => ({ ...f, [key]: [...f[key], ''] }));

  const removeRow = (key: 'ingredients' | 'steps', idx: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const updateRow = (key: 'ingredients' | 'steps', idx: number, val: string) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = val;
      return { ...f, [key]: arr };
    });

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      ingredients: form.ingredients.filter((i) => i.trim() !== ''),
      steps: form.steps.filter((s) => s.trim() !== ''),
      category: form.category,
      cuisine: form.cuisine,
      prepTimeMinutes: Number(form.prepTimeMinutes),
      cookTimeMinutes: Number(form.cookTimeMinutes),
      servings: Number(form.servings),
      priority: Number(form.priority),
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      imageUrl: form.imageUrl.trim() || undefined,
    };

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setServerError('Your session has expired. Please log in again.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      const created = await res.json();
      router.push(`/recipes/${created._id}`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  const sectionCls =
    'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-5';

  const sectionHeading = (accent: string, label: string) => (
    <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2.5 pb-1 border-b border-zinc-100 dark:border-zinc-800">
      <span className={`w-1 h-5 rounded-full ${accent} flex-shrink-0`} />
      {label}
    </h2>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ── Global server error ── */}
      {serverError && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-5 py-4 text-sm">
          <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── 1. Basic Info ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-[var(--primary)]', 'Basic Information')}

        {/* Title */}
        <div data-error={!!errors.title}>
          <FieldLabel htmlFor="title">Recipe Title <span className="text-red-500">*</span></FieldLabel>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Classic Spaghetti Carbonara"
            className={inputCls(!!errors.title)}
            disabled={submitting}
          />
          <FieldError msg={errors.title} />
        </div>

        {/* Short Description */}
        <div data-error={!!errors.shortDescription}>
          <FieldLabel htmlFor="shortDescription" hint={`${form.shortDescription.length}/150`}>
            Short Description <span className="text-red-500">*</span>
          </FieldLabel>
          <input
            id="shortDescription"
            type="text"
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
            maxLength={150}
            placeholder="A quick tagline for your recipe..."
            className={inputCls(!!errors.shortDescription)}
            disabled={submitting}
          />
          <FieldError msg={errors.shortDescription} />
        </div>

        {/* Full Description */}
        <div data-error={!!errors.fullDescription}>
          <FieldLabel htmlFor="fullDescription">Full Description <span className="text-red-500">*</span></FieldLabel>
          <textarea
            id="fullDescription"
            rows={5}
            value={form.fullDescription}
            onChange={(e) => set('fullDescription', e.target.value)}
            placeholder="Tell us all about this recipe — its origins, what makes it special, tips for success..."
            className={`${inputCls(!!errors.fullDescription)} resize-y min-h-[120px]`}
            disabled={submitting}
          />
          <FieldError msg={errors.fullDescription} />
        </div>

        {/* Image URL */}
        <div data-error={!!errors.imageUrl}>
          <FieldLabel htmlFor="imageUrl" hint="optional">Image URL</FieldLabel>
          <input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={inputCls(!!errors.imageUrl)}
            disabled={submitting}
          />
          <FieldError msg={errors.imageUrl} />
        </div>
      </div>

      {/* ── 2. Classification ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-[var(--secondary)]', 'Classification')}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Category */}
          <div data-error={!!errors.category}>
            <FieldLabel htmlFor="category">Category <span className="text-red-500">*</span></FieldLabel>
            <div className="relative">
              <select
                id="category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={`${inputCls(!!errors.category)} appearance-none pr-9`}
                disabled={submitting}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronIcon />
            </div>
            <FieldError msg={errors.category} />
          </div>

          {/* Cuisine */}
          <div data-error={!!errors.cuisine}>
            <FieldLabel htmlFor="cuisine">Cuisine <span className="text-red-500">*</span></FieldLabel>
            <div className="relative">
              <select
                id="cuisine"
                value={form.cuisine}
                onChange={(e) => set('cuisine', e.target.value)}
                className={`${inputCls(!!errors.cuisine)} appearance-none pr-9`}
                disabled={submitting}
              >
                <option value="">Select…</option>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronIcon />
            </div>
            <FieldError msg={errors.cuisine} />
          </div>

          {/* Difficulty */}
          <div data-error={!!errors.priority}>
            <FieldLabel htmlFor="priority">Difficulty <span className="text-red-500">*</span></FieldLabel>
            <div className="relative">
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className={`${inputCls(!!errors.priority)} appearance-none pr-9`}
                disabled={submitting}
              >
                <option value="">Select…</option>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
            <FieldError msg={errors.priority} />
          </div>
        </div>
      </div>

      {/* ── 3. Timing & Servings ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-[var(--accent)]', 'Timing & Servings')}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <NumField
            id="prepTimeMinutes" label="Prep Time (min)" placeholder="e.g. 15"
            value={form.prepTimeMinutes} error={errors.prepTimeMinutes}
            onChange={(v) => set('prepTimeMinutes', v)} disabled={submitting}
          />
          <NumField
            id="cookTimeMinutes" label="Cook Time (min)" placeholder="e.g. 30"
            value={form.cookTimeMinutes} error={errors.cookTimeMinutes}
            onChange={(v) => set('cookTimeMinutes', v)} disabled={submitting}
          />
          <NumField
            id="servings" label="Servings" placeholder="e.g. 4"
            value={form.servings} error={errors.servings}
            onChange={(v) => set('servings', v)} disabled={submitting}
          />
        </div>
      </div>

      {/* ── 4. Nutrition ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-blue-400', 'Nutrition (per serving)')}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <NumField
            id="calories" label="Calories (kcal)" placeholder="e.g. 450"
            value={form.calories} error={errors.calories}
            onChange={(v) => set('calories', v)} disabled={submitting}
          />
          <NumField
            id="protein" label="Protein (g)" placeholder="e.g. 28"
            value={form.protein} error={errors.protein}
            onChange={(v) => set('protein', v)} disabled={submitting}
          />
          <NumField
            id="carbs" label="Carbs (g)" placeholder="e.g. 52"
            value={form.carbs} error={errors.carbs}
            onChange={(v) => set('carbs', v)} disabled={submitting}
          />
          <NumField
            id="fat" label="Fat (g)" placeholder="e.g. 18"
            value={form.fat} error={errors.fat}
            onChange={(v) => set('fat', v)} disabled={submitting}
          />
        </div>
      </div>

      {/* ── 5. Ingredients ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-[var(--secondary)]', 'Ingredients')}

        {errors.ingredients && (
          <FieldError msg={errors.ingredients} />
        )}

        <div className="space-y-3">
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--secondary)]/15 text-[var(--secondary)] text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <input
                id={`ingredient-${idx}`}
                type="text"
                value={ing}
                onChange={(e) => {
                  updateRow('ingredients', idx, e.target.value);
                  setErrors((err) => ({ ...err, ingredients: undefined }));
                }}
                placeholder={`Ingredient ${idx + 1}…`}
                className={inputCls(false)}
                disabled={submitting}
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow('ingredients', idx)}
                  disabled={submitting}
                  aria-label="Remove ingredient"
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addRow('ingredients')}
          disabled={submitting}
          className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[var(--secondary)] hover:text-[var(--secondary)]/80 transition-colors"
        >
          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          Add Ingredient
        </button>
      </div>

      {/* ── 6. Steps ── */}
      <div className={sectionCls}>
        {sectionHeading('bg-[var(--primary)]', 'Instructions / Steps')}

        {errors.steps && (
          <FieldError msg={errors.steps} />
        )}

        <div className="space-y-3">
          {form.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-2.5 w-7 h-7 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <textarea
                id={`step-${idx}`}
                rows={2}
                value={step}
                onChange={(e) => {
                  updateRow('steps', idx, e.target.value);
                  setErrors((err) => ({ ...err, steps: undefined }));
                }}
                placeholder={`Step ${idx + 1}: Describe what to do…`}
                className={`${inputCls(false)} resize-y min-h-[60px] flex-1`}
                disabled={submitting}
              />
              {form.steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow('steps', idx)}
                  disabled={submitting}
                  aria-label="Remove step"
                  className="flex-shrink-0 mt-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addRow('steps')}
          disabled={submitting}
          className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
        >
          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          Add Step
        </button>
      </div>

      {/* ── Submit ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          <span className="text-red-500">*</span> Required fields
        </p>
        <button
          type="submit"
          id="submit-recipe-btn"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 
            bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.98]
            text-white font-semibold text-sm rounded-xl shadow-lg shadow-[var(--primary)]/20
            disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publishing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Publish Recipe
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────── Helper components ─────────────────────── */

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function NumField({
  id, label, placeholder, value, error, onChange, disabled,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div data-error={!!error}>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--foreground)] mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls(!!error)}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
