# Project Context & Rules

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js (Express)
- Database: MongoDB
- Styling: Tailwind CSS

## Architecture Rules
1. Never write logic inside UI components. Use the `/services` folder. allow only UI logic in the components.
2. Always use TypeScript interfaces for API responses.
3. Client cannot access Database directly.
4. If has a component that is used in more than 3 places, move it to the `/components` folder.
5. If can use a component from the design system, use it instead of creating a new one.


## Style Guide
- Use functional components.
- Use async/await syntax.