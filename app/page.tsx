import {getFastDashboard} from '../lib/snapshot-service';
import LiveDashboard from './live-dashboard';
import {fetchGlobalIndices} from '../lib/global-indices';
export const dynamic='force-dynamic';
export default async function Home(){const [d,g]=await Promise.all([getFastDashboard(),fetchGlobalIndices()]);return <LiveDashboard initialData={d} initialGlobal={g}/>}
