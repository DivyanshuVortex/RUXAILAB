/**
 * WCAG 2.1 AA Success Criteria List
 * Grouped by Principles and Guidelines
 */
export const WCAG_CRITERIA = [
  // Principle 1: Perceivable
  {
    principle: 'Perceivable',
    guideline: '1.1 Text Alternatives',
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A', handle: 'chroma_check' }
    ]
  },
  {
    principle: 'Perceivable',
    guideline: '1.2 Time-based Media',
    criteria: [
      { id: '1.2.1', name: 'Audio-only and Video-only (Prerecorded)', level: 'A' },
      { id: '1.2.2', name: 'Captions (Prerecorded)', level: 'A' },
      { id: '1.2.3', name: 'Audio Description or Media Alternative (Prerecorded)', level: 'A' },
      { id: '1.2.4', name: 'Captions (Live)', level: 'AA' },
      { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'AA' }
    ]
  },
  {
    principle: 'Perceivable',
    guideline: '1.3 Adaptable',
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.3.2', name: 'Meaningful Sequence', level: 'A' },
      { id: '1.3.3', name: 'Sensory Characteristics', level: 'A' },
      { id: '1.3.4', name: 'Orientation', level: 'AA' },
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' }
    ]
  },
  {
    principle: 'Perceivable',
    guideline: '1.4 Distinguishable',
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.2', name: 'Audio Control', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', handle: 'chroma_check' },
      { id: '1.4.4', name: 'Resize text', level: 'AA' },
      { id: '1.4.5', name: 'Images of Text', level: 'AA' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' }
    ]
  },
  // Principle 2: Operable
  {
    principle: 'Operable',
    guideline: '2.1 Keyboard Accessible',
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.1.4', name: 'Character Key Shortcuts', level: 'A' }
    ]
  },
  {
    principle: 'Operable',
    guideline: '2.2 Enough Time',
    criteria: [
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A' },
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' }
    ]
  },
  {
    principle: 'Operable',
    guideline: '2.3 Seizures and Physical Reactions',
    criteria: [
      { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'A' }
    ]
  },
  {
    principle: 'Operable',
    guideline: '2.4 Navigable',
    criteria: [
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '2.4.2', name: 'Page Titled', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A', handle: 'anchor_sense' },
      { id: '2.4.5', name: 'Multiple Ways', level: 'AA' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' }
    ]
  },
  {
    principle: 'Operable',
    guideline: '2.5 Input Modalities',
    criteria: [
      { id: '2.5.1', name: 'Pointer Gestures', level: 'A' },
      { id: '2.5.2', name: 'Pointer Cancellation', level: 'A' },
      { id: '2.5.3', name: 'Label in Name', level: 'A' },
      { id: '2.5.4', name: 'Motion Actuation', level: 'A' }
    ]
  },
  // Principle 3: Understandable
  {
    principle: 'Understandable',
    guideline: '3.1 Readable',
    criteria: [
      { id: '3.1.1', name: 'Language of Page', level: 'A' },
      { id: '3.1.2', name: 'Language of Parts', level: 'AA' }
    ]
  },
  {
    principle: 'Understandable',
    guideline: '3.2 Predictable',
    criteria: [
      { id: '3.2.1', name: 'On Focus', level: 'A' },
      { id: '3.2.2', name: 'On Input', level: 'A' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
      { id: '3.2.4', name: 'Consistent Identification', level: 'AA' }
    ]
  },
  {
    principle: 'Understandable',
    guideline: '3.3 Input Assistance',
    criteria: [
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.2', name: 'Labels or Instructions', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '3.3.4', name: 'Error Prevention (Legal, Financial, Data)', level: 'AA' }
    ]
  },
  // Principle 4: Robust
  {
    principle: 'Robust',
    guideline: '4.1 Compatible',
    criteria: [
      { id: '4.1.1', name: 'Parsing', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' }
    ]
  }
];

export const FLAT_WCAG_CRITERIA = WCAG_CRITERIA.reduce((acc, current) => {
  return acc.concat(current.criteria);
}, []);
