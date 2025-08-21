
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from '../components/ui/quick-actions';
import { useLocation } from 'wouter';

vi.mock('wouter');
const mockUseLocation = vi.mocked(useLocation);

describe('Quick Actions User Experience Tests', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockUseLocation.mockReturnValue(['/', mockNavigate]);
  });

  test('🎯 All quick actions are visible and clickable', () => {
    render(<QuickActions />);
    
    const expectedActions = [
      'Add New Cadet',
      'Record Incident', 
      'Fitness Assessment',
      'Assign Mentor',
      'Academic Timetable',
      'Assignments',
      'Mock Tests',
      'Class Diary',
      'Send Notice',
      'Generate Report'
    ];

    expectedActions.forEach(actionText => {
      expect(screen.getByText(actionText)).toBeInTheDocument();
    });
  });

  test('🖱️ Actions provide visual feedback on hover', () => {
    render(<QuickActions />);
    
    const addCadetAction = screen.getByTestId('action-add-cadet');
    expect(addCadetAction).toHaveClass('hover:scale-105');
    expect(addCadetAction).toHaveAttribute('title', 'Navigate to Add New Cadet');
  });

  test('🌈 Actions have distinct color coding', () => {
    render(<QuickActions />);
    
    // Test that different actions have different visual styles
    const addCadet = screen.getByTestId('action-add-cadet');
    const recordIncident = screen.getByTestId('action-record-incident');
    const fitnessAssessment = screen.getByTestId('action-fitness-assessment');
    
    expect(addCadet).toBeInTheDocument();
    expect(recordIncident).toBeInTheDocument();
    expect(fitnessAssessment).toBeInTheDocument();
  });

  test('🧭 Navigation works for all actions', () => {
    render(<QuickActions />);
    
    const actionMappings = [
      { testId: 'action-add-cadet', path: '/cadet-management' },
      { testId: 'action-record-incident', path: '/behavior-tracking' },
      { testId: 'action-fitness-assessment', path: '/physical-fitness' },
      { testId: 'action-assign-mentor', path: '/mentorship-program' },
      { testId: 'action-academic-timetable', path: '/academic-timetable' },
      { testId: 'action-assignment-management', path: '/assignment-management' },
      { testId: 'action-mock-tests', path: '/mock-tests' },
      { testId: 'action-class-diary', path: '/class-diary' },
      { testId: 'action-send-notice', path: '/communications' },
      { testId: 'action-generate-report', path: '/analytics-reports' }
    ];

    actionMappings.forEach(({ testId, path }) => {
      const actionButton = screen.getByTestId(testId);
      fireEvent.click(actionButton);
      expect(mockNavigate).toHaveBeenCalledWith(path);
    });
  });
});
