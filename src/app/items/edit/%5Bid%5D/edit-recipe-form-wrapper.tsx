'use client';

import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/forms/recipe-form';

interface EditRecipeFormWrapperProps {
  recipe: any;
}

export function EditRecipeFormWrapper({ recipe }: EditRecipeFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (payload: any) => {
    const res = await fetch(`/api/recipes/${recipe._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    const updated = await res.json();
    router.push(`/recipes/${updated._id}`);
  };

  return (
    <RecipeForm
      initialData={recipe}
      submitLabel="Update Recipe"
      onSubmit={handleSubmit}
    />
  );
}
