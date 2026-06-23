// The route shell. Was previously a bespoke header + main wrapper; now
// delegates to the Layout component which carries the Penumbra Tech
// branded NavBar and Footer. main.jsx still imports App, so the routing
// table stayed identical.

import Layout from './components/Layout.jsx';

export default function App() {
  return <Layout />;
}
