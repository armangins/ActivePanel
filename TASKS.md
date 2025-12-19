# Future Features & Technical Debt

## Features
- [ ] **Real Data for Order Status Wave Charts**: Connect `OrderStatusCards.tsx` to the Reports API to show actual historical trends instead of mock data. The current implementation uses random mock data for visual demonstration.

## Technical Debt / Cleanup
- [ ] **Remove Unused UI Components**: Delete the following components that have been replaced by Ant Design or are no longer used:
    - `src/components/ui/buttons/Button.jsx`
    - `src/components/ui/inputs/Input.jsx`
    - `src/components/ui/modals/Modal.jsx`
    - `src/components/ui/tables/Table.jsx`
    - `src/components/ui/Pagination/Pagination.jsx`
    - `src/components/ui/Toast/Toast.jsx`
    - `src/components/ui/common/Breadcrumbs.jsx`
    - `src/components/ui/common/UploadIcon.jsx`
    - `src/components/ui/indicators/LoadingMoreIndicator.jsx`
    - `src/components/ui/SetupRequired.jsx`
