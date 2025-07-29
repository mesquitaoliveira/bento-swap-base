import SwapInterface from "./components/SwapInterface";
import Header from "./components/Header";
import { Web3Provider } from "./components/Web3Provider";

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8 px-4">
          <div className="max-w-md mx-auto">
            <SwapInterface />
          </div>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;
