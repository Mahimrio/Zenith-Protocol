import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const RouteErrorScreen: React.FC = () => {
  const error = useRouteError();

  let title = 'Unexpected Application Error';
  let message = 'Something went wrong while loading this route.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    if (typeof error.data === 'string' && error.data.trim().length > 0) {
      message = error.data;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-glass border border-border-glass rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="text-text-muted mb-6">{message}</p>
        <a href="/" className="inline-flex px-4 py-2 rounded-lg bg-neon-cyan text-black font-semibold">
          Back to menu
        </a>
      </div>
    </div>
  );
};
