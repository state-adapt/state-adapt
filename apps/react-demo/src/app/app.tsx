import React, { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useStore } from '@state-adapt/react';

import { CartPage, cartStore } from './cart';
import { CounterPage } from './counter';
import { CrewPage, crewStore } from './crew';
import { Home } from './home';
import { LivePage, TickerKeepAlive, TickerLifecycle } from './live';
import { TodosPage, todosStore } from './todos';

function Badge({ count, testId }: { count: number; testId: string }) {
  if (!count) return null;
  return (
    <span className="badge" data-testid={testId}>
      {count}
    </span>
  );
}

export function App() {
  const [todos] = useStore(todosStore);
  const [cart] = useStore(cartStore);
  const [crew] = useStore(crewStore);

  const [keepAlive, setKeepAlive] = useState(false);

  return (
    <div className="app">
      {keepAlive && <TickerKeepAlive />}

      <header className="topbar">
        <a
          className="brand"
          href="https://state-adapt.github.io/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://state-adapt.github.io/sa3-3.svg"
            className="logo stateadapt"
            alt="StateAdapt logo"
          />
          <span className="brand-name">StateAdapt</span>
        </a>

        <nav className="nav" aria-label="Demo sections">
          <NavLink to="/" end data-testid="nav-home">
            Home
          </NavLink>
          <NavLink to="/counter" data-testid="nav-counter">
            Counter
          </NavLink>
          <NavLink to="/todos" data-testid="nav-todos">
            Todos
            <Badge count={todos.activeCount} testId="nav-todos-badge" />
          </NavLink>
          <NavLink to="/cart" data-testid="nav-cart">
            Cart
            <Badge count={cart.itemCount} testId="nav-cart-badge" />
          </NavLink>
          <NavLink to="/crew" data-testid="nav-crew">
            Crew
            <Badge count={crew.selectedCount} testId="nav-crew-badge" />
          </NavLink>
          <NavLink to="/live" data-testid="nav-live">
            Live
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/counter" element={<CounterPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/crew" element={<CrewPage />} />
          <Route path="/crew/:callSign" element={<CrewPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <TickerLifecycle />
        <label className="keep-alive">
          <input
            type="checkbox"
            data-testid="keep-alive"
            checked={keepAlive}
            onChange={event => setKeepAlive(event.target.checked)}
          />
          Keep ticker alive
        </label>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <section className="panel" data-testid="not-found">
      <h1>Not found</h1>
      <p className="muted">That route doesn&apos;t exist in this demo.</p>
      <NavLink className="button" to="/">
        Back home
      </NavLink>
    </section>
  );
}

export default App;
