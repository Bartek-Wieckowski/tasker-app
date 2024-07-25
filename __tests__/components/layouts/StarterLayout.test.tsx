import {  screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StarterLayout from '@/components/shared/StarterLayout';
import { render } from '../../setup';

describe('StarterLayout component', () => {
  it('should render two Container components', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<StarterLayout />} />
        </Routes>
      </MemoryRouter>
    );

    const containers = screen.getAllByTestId('container');

    expect(containers).toHaveLength(2);
  });

  it('should render Outlet inside the second Container', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<StarterLayout />}>
            <Route path="/" element={<div data-testid="outlet-content">Outlet Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const containers = screen.getAllByTestId('container');

    const secondContainer = containers[1];

    expect(secondContainer).toContainElement(screen.getByTestId('outlet-content'));
  });
});
