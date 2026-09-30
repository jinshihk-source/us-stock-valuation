import {getFastDashboard} from '../lib/snapshot-service';
import LiveDashboard from './live-dashboard';
export const dynamic='force-dynamic';
export default async function Home(){const d=await getFastDashboard();return <LiveDashboard initialData={d}/>}
